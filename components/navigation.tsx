"use client"

import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Home, Calendar, User, LogOut, Menu, PawPrintIcon as Paw } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navigation() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const closeSheet = () => {
    setOpen(false)
  }

  const renderNavLinks = () => {
    if (!user) {
      return (
        <>
          <Link href="/login" onClick={closeSheet}>
            <Button variant={isActive("/login") ? "default" : "ghost"}>Login</Button>
          </Link>
          <Link href="/register" onClick={closeSheet}>
            <Button variant={isActive("/register") ? "default" : "ghost"}>Register</Button>
          </Link>
        </>
      )
    }

    // Common links for all users
    const links = [
      <Link
        key="home"
        href="/"
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive("/") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        onClick={closeSheet}
      >
        <Home size={18} />
        <span>Home</span>
      </Link>,
    ]

    // Role-specific links
    if (user.role === "pet_owner") {
      links.push(
        <Link
          key="pets"
          href="/pets"
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive("/pets") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          onClick={closeSheet}
        >
          <Paw size={18} />
          <span>My Pets</span>
        </Link>,
        <Link
          key="appointments"
          href="/appointments"
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive("/appointments") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          onClick={closeSheet}
        >
          <Calendar size={18} />
          <span>Appointments</span>
        </Link>,
      )
    } else if (user.role === "doctor") {
      links.push(
        <Link
          key="schedule"
          href="/doctor/schedule"
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive("/doctor/schedule") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          onClick={closeSheet}
        >
          <Calendar size={18} />
          <span>My Schedule</span>
        </Link>,
      )
    } else if (user.role === "staff") {
      links.push(
        <Link
          key="dashboard"
          href="/staff/dashboard"
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive("/staff/dashboard") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          onClick={closeSheet}
        >
          <Calendar size={18} />
          <span>Dashboard</span>
        </Link>,
      )
    }

    // Profile and logout for all authenticated users
    links.push(
      <Link
        key="profile"
        href="/profile"
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive("/profile") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        onClick={closeSheet}
      >
        <User size={18} />
        <span>Profile</span>
      </Link>,
      <Button
        key="logout"
        variant="ghost"
        className="flex items-center gap-2 px-4 py-2 w-full justify-start"
        onClick={() => {
          closeSheet()
          signOut()
        }}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </Button>,
    )

    return links
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Paw className="h-6 w-6" />
          <span>Petty</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">{renderNavLinks()}</div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 mt-8">{renderNavLinks()}</div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
