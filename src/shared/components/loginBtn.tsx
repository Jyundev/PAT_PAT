type Props = {
  onClickEvent: () => void;
  title: string;
  icon?: string;
  style?: string;
  disable?: boolean;
};
export default function LoginButton({
  onClickEvent,
  title,
  icon,
  style,
  disable,
}: Props) {
  return (
    <button
      type="button"
      onClick={disable ? undefined : onClickEvent}
      disabled={disable}
      className={[
        // 공통 버튼 베이스 (앱 전체 규칙)
        'flex items-center justify-center gap-2 w-full',
        'py-4 text-[16px]',
        'rounded-2xl',
        'transition active:scale-[0.99]',
        'outline-none focus:outline-none',
        //  disabled 규칙 통일 (기존 0.5 → 0.4로 앱과 맞춤)
        disable ? 'opacity-40 cursor-not-allowed' : '',
        //  페이지에서 넘긴 스타일
        style,
      ].join(' ')}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className="w-5 h-5 object-contain"
          draggable={false}
        />
      )}
      {title}
    </button>
  );
}
