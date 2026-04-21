import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Type, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const DocsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text font-mono">Документация</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Руководство по параметрам генерации в Nexagen
          </p>
        </header>

        <nav className="mb-10 p-4 bg-secondary/50 rounded-lg border border-border">
          <h2 className="text-sm font-semibold mb-3 text-foreground">Содержание</h2>
          <ul className="space-y-1 text-sm">
            <li><a href="#text" className="text-primary hover:underline">→ Параметры генерации текста</a></li>
            <li><a href="#image" className="text-primary hover:underline">→ Параметры генерации изображений</a></li>
            <li><a href="#video" className="text-primary hover:underline">→ Параметры генерации видео</a></li>
            <li><a href="#tips" className="text-primary hover:underline">→ Советы и рекомендации</a></li>
          </ul>
        </nav>

        {/* TEXT */}
        <section id="text" className="mb-12 scroll-mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Type className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Параметры генерации текста</h2>
          </div>

          <div className="space-y-6">
            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Model (Модель)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Выбор языковой модели, которая будет обрабатывать ваш запрос. Разные модели отличаются
                скоростью, качеством ответов и стоимостью.
              </p>
              <p className="text-xs text-muted-foreground italic">
                Рекомендация: для коротких ответов подойдут быстрые модели, для сложных задач — более мощные.
              </p>
            </article>

            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Temperature (Температура)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Контролирует степень случайности и креативности ответа. Диапазон: <code className="text-primary">0 — 2</code>.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li><strong className="text-foreground">0 — 0.3</strong>: точные, предсказуемые ответы (код, факты, формальные тексты)</li>
                <li><strong className="text-foreground">0.7 — 1.0</strong>: сбалансированные ответы (универсальный режим)</li>
                <li><strong className="text-foreground">1.5 — 2.0</strong>: максимально креативные и разнообразные ответы</li>
              </ul>
            </article>

            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Max Tokens (Максимум токенов)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Максимальная длина ответа модели. Один токен ≈ 0.75 английских слов или ~0.5 русских слов.
              </p>
              <p className="text-xs text-muted-foreground italic">
                Минимум: 1, максимум: 32 768. Чем больше значение — тем длиннее может быть ответ, но и стоимость генерации выше.
              </p>
            </article>
          </div>
        </section>

        {/* IMAGE */}
        <section id="image" className="mb-12 scroll-mt-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Параметры генерации изображений</h2>
          </div>

          <div className="space-y-6">
            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Model (Модель)</h3>
              <p className="text-sm text-muted-foreground">
                Модель генерации изображений. Каждая модель имеет свой уникальный визуальный стиль и сильные стороны.
              </p>
            </article>

            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Number of images (Количество изображений)</h3>
              <p className="text-sm text-muted-foreground">
                Сколько вариантов изображений сгенерировать за один запрос (от 1 до 4). Полезно для выбора лучшего варианта.
              </p>
            </article>

            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Size (Размер)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Разрешение и соотношение сторон итогового изображения.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li><strong className="text-foreground">1024×1024</strong> — квадрат, универсальный формат</li>
                <li><strong className="text-foreground">1792×1024</strong> — горизонтальный (баннеры, обложки)</li>
                <li><strong className="text-foreground">1024×1792</strong> — вертикальный (мобильные обои, постеры)</li>
                <li><strong className="text-foreground">512×512</strong> — компактный, быстрый превью</li>
              </ul>
            </article>

            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Quality (Качество)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Уровень детализации и проработки изображения.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li><strong className="text-foreground">Low</strong> — быстрая генерация, минимальные затраты</li>
                <li><strong className="text-foreground">Medium</strong> — баланс качества и скорости</li>
                <li><strong className="text-foreground">High</strong> — максимальная детализация (медленнее и дороже)</li>
              </ul>
            </article>
          </div>
        </section>

        {/* VIDEO */}
        <section id="video" className="mb-12 scroll-mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Параметры генерации видео</h2>
          </div>

          <div className="space-y-6">
            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Model (Модель)</h3>
              <p className="text-sm text-muted-foreground">
                Видео-модель определяет стиль, плавность движения и качество финального ролика.
              </p>
            </article>

            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Size (Размер)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Разрешение и ориентация видео.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li><strong className="text-foreground">1280×720 (HD)</strong> — стандартное HD-качество</li>
                <li><strong className="text-foreground">1920×1080 (Full HD)</strong> — высокое разрешение</li>
                <li><strong className="text-foreground">720×1280 (Portrait)</strong> — вертикальное видео для мобильных платформ</li>
              </ul>
            </article>

            <article className="p-5 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Duration (Длительность)</h3>
              <p className="text-sm text-muted-foreground">
                Продолжительность ролика в секундах: 5, 10 или 15. Чем длиннее видео — тем выше затраты и время генерации.
              </p>
            </article>
          </div>
        </section>

        {/* TIPS */}
        <section id="tips" className="mb-12 scroll-mt-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Советы и рекомендации</h2>
          <div className="p-5 bg-card rounded-lg border border-border">
            <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
              <li>Начинайте с дефолтных параметров и постепенно их корректируйте.</li>
              <li>Чем больше Max Tokens или Quality — тем выше стоимость запроса.</li>
              <li>Для творческих задач увеличивайте Temperature, для технических — снижайте.</li>
              <li>Используйте генерацию нескольких изображений сразу, чтобы выбрать лучший вариант.</li>
              <li>Описывайте промпт максимально конкретно — это сильнее влияет на результат, чем тонкая настройка параметров.</li>
            </ul>
          </div>
        </section>

        <footer className="border-t border-border pt-6 mt-10">
          <p className="text-xs text-muted-foreground text-center">
            Документация Nexagen · Если у вас остались вопросы — обратитесь в поддержку.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DocsPage;
