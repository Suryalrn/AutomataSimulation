export default function WebGLFallback() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center p-8 opacity-25">
      <svg
        viewBox="0 0 800 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-4xl h-auto"
      >
        {/* NFA Nodes */}
        <circle cx="150" cy="200" r="28" stroke="#6AA7FF" strokeWidth="2" fill="#0E1218" />
        <text x="150" y="205" textAnchor="middle" fill="#E8ECF2" fontFamily="JetBrains Mono" fontSize="13">
          q0
        </text>

        <circle cx="320" cy="120" r="28" stroke="#FFB547" strokeWidth="2" fill="#0E1218" />
        <text x="320" y="125" textAnchor="middle" fill="#E8ECF2" fontFamily="JetBrains Mono" fontSize="13">
          q1
        </text>

        <circle cx="320" cy="280" r="28" stroke="#FFB547" strokeWidth="2" fill="#0E1218" />
        <text x="320" y="285" textAnchor="middle" fill="#E8ECF2" fontFamily="JetBrains Mono" fontSize="13">
          q2
        </text>

        <circle cx="520" cy="200" r="28" stroke="#5CF2C0" strokeWidth="2" fill="#0E1218" />
        <circle cx="520" cy="200" r="34" stroke="#5CF2C0" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="520" y="205" textAnchor="middle" fill="#5CF2C0" fontFamily="JetBrains Mono" fontSize="13">
          q4
        </text>

        {/* Transition Arrows */}
        <path d="M 178 190 Q 235 155 292 125" stroke="#FFB547" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="235" y="150" fill="#FFB547" fontFamily="JetBrains Mono" fontSize="11">ε</text>

        <path d="M 178 210 Q 235 245 292 275" stroke="#FFB547" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="235" y="260" fill="#FFB547" fontFamily="JetBrains Mono" fontSize="11">ε</text>

        <path d="M 348 280 L 492 210" stroke="#6AA7FF" strokeWidth="1.5" />
        <text x="420" y="235" fill="#6AA7FF" fontFamily="JetBrains Mono" fontSize="11">0</text>
      </svg>
    </div>
  )
}
