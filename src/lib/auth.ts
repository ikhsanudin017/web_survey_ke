import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "employee",
      id: "employee",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const employee = await prisma.employee.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!employee) {
          return null
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
          role: "employee"
        }
      }
    }),
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
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin"
  }
}
