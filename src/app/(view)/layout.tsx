'use client';

import { Providers } from '../providers';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen bg-[linear-gradient(to_bottom,#000A2D_0%,#030D32_40%,#14295A_100%)] overflow-hidden">
      <div className="relative z-10 flex flex-col w-full h-full">
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}
