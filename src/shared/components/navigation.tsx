import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
 absolute bottom-4 left-1/2 -translate-x-1/2
    w-full px-4 h-[64px]
    z-50
    pb-[env(safe-area-inset-bottom)]
      "
    >
      <div className="rounded-2xl bg-white/6 backdrop-blur-lg border border-white/10 px-3 py-2">
        <ul className="flex items-center justify-between text-white/85">
          <li>
            <Link
              href="/home"
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${
                pathname === '/home' ? 'bg-white/8' : ''
              }`}
            >
              <HomeIcon />
              <span className="text-[10px] text-white">홈</span>
            </Link>
          </li>
          <li>
            <Link
              href="/diary/editor"
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg  ${
                pathname === '/diary/editor' ? 'bg-white/8' : ''
              } `}
            >
              <NoteIcon />
              <span className="text-[10px] text-white">일기쓰기</span>
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg  ${
                pathname === '/profile' ? 'bg-white/8' : ''
              } `}
            >
              <UserIcon />
              <span className="text-[10px] text-white">MY 루미</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

/* --- Icons (스타일 통일: 선 두께/라운드 통일) --- */

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 21V14.5A1.5 1.5 0 0 1 11 13h2a1.5 1.5 0 0 1 1.5 1.5V21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 3.5h7.5L20.5 9v11A1.5 1.5 0 0 1 19 21.5H7A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 3.5V8A1 1 0 0 0 15.5 9h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8.5 13h7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8.5 16.5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 12.2a4.2 4.2 0 1 0-4.2-4.2 4.2 4.2 0 0 0 4.2 4.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.5 20.5c1.8-3 4.2-4.3 6.5-4.3s4.7 1.3 6.5 4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
