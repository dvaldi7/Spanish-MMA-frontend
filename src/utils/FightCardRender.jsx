import React from 'react';

const FightCardRender = ({ description }) => {
  if (!description) return null;

  // Separamos por líneas y filtramos líneas vacías
  const lines = description.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="flex flex-col gap-2">
      {lines.map((line, index) => {
        //  separar por VS
        const fighters = line.split(/\s+VS\s+/i);

        return (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 
          rounded border border-gray-100">
            {fighters.map((fighter, fIndex) => {
              const isWinner = fighter.includes('*');
              const cleanName = fighter.replace('*', '').trim();

              return (
                <div key={fIndex} className="flex items-center gap-2">
                  <span className={`text-sm font-bold uppercase ${isWinner ? 'text-green-600' 
                    : 'text-gray-800'}`}>
                    {cleanName}
                  </span>
                  {isWinner && (
                    <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 
                    rounded-full font-bold">
                      WINNER
                    </span>
                  )}
                </div>
              );
            })}
            {/* Si solo hay un peleador en la línea (no hay VS) */}
            {fighters.length === 1 && (
               <span className="text-xs text-gray-400 italic">Combate pendiente</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FightCardRender;