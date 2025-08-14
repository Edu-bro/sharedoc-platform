import { auth } from "@/auth"

export default auth((req) => {
  // Your middleware logic here
  console.log("Auth middleware:", req.auth?.user?.email)
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}