import React from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function Layout({
  children,
}: {
  children: React.ReactElement[] | React.ReactElement
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-slate-50 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
