import CredentialsProvider from "next-auth/providers/credentials"

const employees = [
  { id: 'sayudi', name: 'Sayudi', password: 'sayudi123', role: 'employee' },
  { id: 'upik', name: 'Upik', password: 'upik123', role: 'employee' },
  { id: 'arwan', name: 'Arwan', password: 'arwan123', role: 'employee' },
  { id: 'winarno', name: 'Winarno', password: 'winarno123', role: 'employee' },
  { id: 'toha', name: 'Toha', password: 'toha123', role: 'approver' }
];

/* eslint-disable @typescript-eslint/no-explicit-any */
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
        employeeId: { label: "Employee ID", type: "text" }, // Changed from name to employeeId
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.employeeId || !credentials?.password) {
          return null
        }

        // Find the employee in the hardcoded array
        const employee = employees.find(emp => emp.id === credentials.employeeId);

        // If employee exists and password matches
        if (employee && employee.password === credentials.password) {
          // Return user object with id, name, and role
          return { id: employee.id, name: employee.name, role: employee.role };
        }
        // If no user found or password doesn't match
        return null;
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
    signIn: "/employee/login",
    error: "/employee/login"
  },
  debug: process.env.NODE_ENV === "development"
}
