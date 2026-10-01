import { useState } from 'react';

/**
 * Reusable quiz component. Drop into any lesson:
 *   import Quiz from '../../../components/Quiz.tsx';
 *   <Quiz client:load questions={[{ q, options, answer, why }]} />
 * Self-contained, offline, keyboard-accessible.
 */

export interface Question {
  q: string;
  options: string[];
  answer: number; // index of correct option
  why: string;
}

export default function Quiz({ questions, title = 'Quick check' }: { questions: Question[]; title?: string }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));

  const answered = picked.filter((p) => p !== null).length;
  const correct = picked.filter((p, i) => p === questions[i].answer).length;
  const done = answered === questions.length;

  function pick(qi: number, oi: number) {
    setPicked((prev) => {
      if (prev[qi] !== null) return prev; // lock after first answer
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
  }

  return (
    <div className="wg not-content">
      <h3 data-kind="Quiz">{title}</h3>
      <p className="wg-note">
        {done ? (
          <>
            Score: <strong>{correct} / {questions.length}</strong>.{' '}
            {correct === questions.length ? 'Nailed it.' : 'Read the explanations on any you missed.'}
          </>
        ) : (
          <>Answer each question — pick an option to lock it in and see why.</>
        )}
      </p>

      <ol className="qz-list">
        {questions.map((qq, qi) => {
          const sel = picked[qi];
          const isAnswered = sel !== null;
          return (
            <li key={qi} className="qz-q">
              <p className="qz-prompt">{qq.q}</p>
              <div className="qz-opts">
                {qq.options.map((opt, oi) => {
                  const isCorrect = oi === qq.answer;
                  const isSel = sel === oi;
                  let cls = 'qz-opt';
                  if (isAnswered && isCorrect) cls += ' qz-correct';
                  else if (isAnswered && isSel && !isCorrect) cls += ' qz-wrong';
                  return (
                    <button
                      key={oi}
                      className={cls}
                      onClick={() => pick(qi, oi)}
                      disabled={isAnswered}
                      aria-pressed={isSel}
                    >
                      <span className="qz-mark" aria-hidden="true">
                        {isAnswered && isCorrect ? '✓' : isAnswered && isSel ? '✗' : '○'}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {isAnswered ? (
                <p className={`qz-why ${sel === qq.answer ? 'qz-why-ok' : 'qz-why-no'}`}>
                  {sel === qq.answer ? 'Correct. ' : 'Not quite. '}
                  {qq.why}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <style>{`
        .qz-list { list-style: decimal; margin: 0.4rem 0 0; padding-left: 1.3rem; display: flex; flex-direction: column; gap: 0.9rem; }
        .qz-prompt { font-weight: 600; font-size: 0.9rem; margin: 0 0 0.45rem; }
        .qz-opts { display: flex; flex-direction: column; gap: 0.35rem; }
        .qz-opt { text-align: left; font: inherit; font-size: 0.85rem; border: 1px solid var(--wg-border);
          border-radius: var(--r-md); background: var(--wg-surface-raised); padding: 0.4rem 0.55rem; cursor: pointer;
          display: flex; gap: 0.5rem; align-items: baseline; }
        .qz-opt:disabled { cursor: default; }
        .qz-opt:not(:disabled):hover { border-color: var(--wg-accent); }
        .qz-mark { font-family: var(--wg-mono); flex: none; }
        .qz-opt.qz-correct { background: var(--wg-good-soft); border-color: var(--wg-good); }
        .qz-opt.qz-wrong { background: var(--wg-bad-soft); border-color: var(--wg-bad); }
        .qz-why { font-size: 0.83rem; margin: 0.45rem 0 0; padding: 0.4rem 0.55rem; border-radius: var(--r-sm); background: var(--wg-surface); }
        .qz-why-ok { border-left: 3px solid var(--wg-good); }
        .qz-why-no { border-left: 3px solid var(--wg-bad); }
      `}</style>
    </div>
  );
}
