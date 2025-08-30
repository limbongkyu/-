import React from 'react';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index }) => {
  const imageUrl = `https://picsum.photos/seed/${recipe.recipeName.replace(/\s/g, '')}${index}/600/400`;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-200/50">
      <img className="w-full h-56 object-cover" src={imageUrl} alt={recipe.recipeName} />
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-bold text-stone-800 mb-2">{recipe.recipeName}</h3>
        <p className="text-stone-600 mb-8 italic">"{recipe.description}"</p>

        <div className="mb-8">
          <h4 className="text-xl font-bold text-emerald-700 border-b-2 border-emerald-200 pb-2 mb-4 flex items-center">
            <i className="fa-solid fa-carrot mr-3 text-emerald-500"></i>재료
          </h4>
          <ul className="list-disc list-inside space-y-2 text-stone-700">
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-bold text-emerald-700 border-b-2 border-emerald-200 pb-2 mb-4 flex items-center">
            <i className="fa-solid fa-kitchen-set mr-3 text-emerald-500"></i>만드는 법
          </h4>
          <ol className="list-decimal list-inside space-y-3 text-stone-700 leading-relaxed">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="pl-2">{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;