import Link from "next/link";

export function HomeTextAiCta() {
  return (
    <div className="home-text-ai">
      <Link className="home-text-ai__btn" href="/chat">
        Нейросеть для текста бесплатно
      </Link>
    </div>
  );
}
