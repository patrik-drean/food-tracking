'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export function LogoutButton() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm text-gray-700 hidden sm:inline">
          {session.user?.name}
        </span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Sign out
      </button>
    </div>
  );
}
