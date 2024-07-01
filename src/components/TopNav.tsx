"use client";

import Link from "next/link";

export default function TopNav() {
  return (
    <nav className="bg-gray-800 p-4 w-full flex justify-between items-center">
      <div className="text-white text-xl">Book Manager</div>
      <div className="flex space-x-4">
        <Link href="/add">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Book
          </button>
        </Link>
        <Link href="/books">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            View Books
          </button>
        </Link>
      </div>
    </nav>
  );
}
