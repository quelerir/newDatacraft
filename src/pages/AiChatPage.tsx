import { AiChat } from '../components/AiChat/AiChat';
import { Header } from '../components/Header';

export function AiChatPage() {
  return (
    <div className="app-shell">
      <Header />
      <main className="page-content">
        <section style={{ height: '100%', minHeight: 0 }}>
          <AiChat />
        </section>
      </main>
    </div>
  );
}
