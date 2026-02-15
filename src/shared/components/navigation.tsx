import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: '홈', icon: HomeIcon },
    { href: '/diary-archive', label: '기록', icon: NoteIcon },
    { href: '/profile', label: 'MY', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[400px] px-6 z-50">
      <div className="rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 p-2 shadow-2xl">
        <ul className="flex items-center justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-1.5 py-2 transition-all active:scale-90 ${
                    isActive
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <Icon isActive={isActive} />
                  <span className="text-[10px] font-medium tracking-tighter">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/* --- Icons (스타일 통일: 선 두께/라운드 통일) --- */

interface IconProps {
  isActive?: boolean;
}

function HomeIcon({ isActive }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
      className="transition-all duration-300"
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
        fill={isActive ? 'currentColor' : 'none'} // 활성 시 내부 채움
        fillOpacity={isActive ? '0.2' : '0'} // 은은한 투명도
        stroke="currentColor"
        strokeWidth={isActive ? '2' : '1.7'} // 활성 시 선 두께 강화
        strokeLinejoin="round"
      />
      <path
        d="M9.5 21V14.5A1.5 1.5 0 0 1 11 13h2a1.5 1.5 0 0 1 1.5 1.5V21"
        fill="none"
        stroke="currentColor"
        strokeWidth={isActive ? '2' : '1.7'}
        strokeLinecap="round"
      />
    </svg>
  );
}

function NoteIcon({ isActive }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
      className="transition-all duration-300"
    >
      <path
        d="M7 3.5h7.5L20.5 9v11A1.5 1.5 0 0 1 19 21.5H7A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z"
        fill={isActive ? 'currentColor' : 'none'}
        fillOpacity={isActive ? '0.2' : '0'}
        stroke="currentColor"
        strokeWidth={isActive ? '2' : '1.7'}
        strokeLinejoin="round"
      />
      <path
        d="M14.5 3.5V8A1 1 0 0 0 15.5 9h5"
        fill="none"
        stroke="currentColor"
        strokeWidth={isActive ? '2' : '1.7'}
        strokeLinecap="round"
      />
      <path
        d="M8.5 13h7M8.5 16.5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth={isActive ? '2' : '1.7'}
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({ isActive }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
      className="transition-all duration-300"
    >
      <path
        d="M12 12.2a4.2 4.2 0 1 0-4.2-4.2 4.2 4.2 0 0 0 4.2 4.2Z"
        fill={isActive ? 'currentColor' : 'none'}
        fillOpacity={isActive ? '0.2' : '0'}
        stroke="currentColor"
        strokeWidth={isActive ? '2' : '1.7'}
      />
      <path
        d="M5.5 20.5c1.8-3 4.2-4.3 6.5-4.3s4.7 1.3 6.5 4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth={isActive ? '2' : '1.7'}
        strokeLinecap="round"
      />
    </svg>
  );
}
