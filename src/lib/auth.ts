/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
    providers: [
    CredentialsProvider({
      name: "client",
      id: "client",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const client = await prisma.client.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!client) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            client.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: client.id,
            email: client.email,
            name: client.name,
            role: "client"
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    }),
    CredentialsProvider({
      name: "employee",
      id: "employee",
      credentials: {
        name: { label: "Name", type: "text" }, // Changed from email to name
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Changed from credentials?.email to credentials?.name
        if (!credentials?.name || !credentials?.password) {
          return null
        }

        try {
          const employee = await prisma.employee.findFirst({ // Changed to findFirst
            where: {
              name: credentials.name
            }
          })

          if (!employee) {
            return null
          }

          // Optional: Check if multiple employees have the same name (if name is not unique in schema)
          const duplicateEmployees = await prisma.employee.findMany({
            where: {
              name: credentials.name
            }
          });

          if (duplicateEmployees.length > 1) {
            console.error("Auth attempt: Multiple employees found with the same name. Please ensure names are unique for login:", credentials.name);
            return null; // Prevent login if name is not unique
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            employee.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: employee.id,
            email: employee.email,
            name: employee.name,
            role: "employee",
            position: employee.position
          }
        } catch (error) {
          console.error("Employee auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin"
  },
  debug: process.env.NODE_ENV === "development"
}