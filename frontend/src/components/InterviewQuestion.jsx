import React from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function InterviewQuestion({
  question,
  selectedIndex,
  onSelectOption,
  result, // if evaluated: { is_correct, correct_index, explanation }
  disabled = false,
}) {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm mb-4">
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Q{question.question_index || 1}
          </span>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {question.skill}
          </span>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            question.difficulty === 'Beginner'
              ? 'bg-emerald-50 text-emerald-700'
              : question.difficulty === 'Advanced'
              ? 'bg-purple-50 text-purple-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {question.difficulty}
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-4">
        {question.question}
      </h3>

      {/* Options List */}
      <div className="space-y-2.5">
        {question.options.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          let optionStyle = 'border-slate-200 hover:border-indigo-400 bg-white text-slate-800';

          if (result) {
            // Evaluated mode
            const isCorrect = idx === result.correct_index;
            const isWrongSelection = isSelected && !result.is_correct;

            if (isCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
            } else if (isWrongSelection) {
              optionStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-semibold';
            } else {
              optionStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
            }
          } else if (isSelected) {
            optionStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-2 ring-indigo-500/20';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectOption && onSelectOption(idx)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${optionStyle} ${
                disabled ? 'cursor-default' : ''
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 transition ${
                  isSelected && !result
                    ? 'bg-indigo-600 text-white'
                    : result && idx === result.correct_index
                    ? 'bg-emerald-600 text-white'
                    : result && isSelected && !result.is_correct
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {letters[idx]}
              </span>
              <span className="text-xs sm:text-sm mt-0.5 leading-relaxed">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation Footer if evaluated */}
      {result && (
        <div
          className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${
            result.is_correct
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/60 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {result.is_correct ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Correct Answer!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Incorrect Answer</span>
              </>
            )}
          </div>
          <p className="mt-1 font-normal text-slate-700">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
