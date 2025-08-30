import React, { useState, useCallback } from 'react';
import type { Recipe } from './types';
import { generateRecipes } from './services/geminiService';
import type { RecipeRequest } from './services/geminiService';
import Header from './components/Header';
import Spinner from './components/Spinner';
import RecipeCard from './components/RecipeCard';

// Helper components are defined outside the App component to prevent re-creation on every render,
// which can cause focus loss and other input issues.
const InputGroup: React.FC<{ label: string; htmlFor: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700 mb-2">{label}</label>
        {children}
    </div>
);

const TextInput: React.FC<{id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string;}> = ({id, value, onChange, placeholder}) => (
    <input
        type="text"
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
    />
);

const Select: React.FC<{id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode;}> = ({ id, value, onChange, children }) => (
    <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 bg-white"
    >
        {children}
    </select>
);

// We Omit `healthConditions` from the form's state because it's derived from other states (`selectedHealthConditions` and `otherHealthCondition`)
// This avoids complex effects and makes state management simpler and more predictable.
type FormState = Omit<RecipeRequest, 'healthConditions'>;

const App: React.FC = () => {
    const [formData, setFormData] = useState<FormState>({
        age: '30대',
        gender: '무관',
        allergies: '',
        ingredients: '',
        recipeType: 'any',
    });
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Health condition states are managed separately from the main form data.
    const commonHealthConditions = ['다이어트', '고혈압', '당뇨', '저염식', '고단백', '채식'];
    const [selectedHealthConditions, setSelectedHealthConditions] = useState<string[]>([]);
    const [otherHealthCondition, setOtherHealthCondition] = useState<string>('');

    const handleChange = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setRecipes([]);

        // The health conditions are now combined here, just before the API call,
        // removing the need for a state-synchronizing useEffect.
        const combinedHealthConditions = [...selectedHealthConditions, otherHealthCondition.trim()].filter(Boolean).join(', ');

        const completeRequestData: RecipeRequest = {
            ...formData,
            healthConditions: combinedHealthConditions,
        };

        try {
            const result = await generateRecipes(completeRequestData);
            setRecipes(result);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-stone-800">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-bold text-center mb-2 text-stone-800">나에게 맞는 레시피 찾기</h2>
                    <p className="text-center text-stone-500 mb-8">몇 가지 정보를 알려주시면, Gemini AI가 완벽한 요리를 추천해 드려요!</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="연령대" htmlFor="age">
                                <Select id="age" value={formData.age} onChange={e => handleChange('age', e.target.value)}>
                                    <option>10대</option>
                                    <option>20대</option>
                                    <option>30대</option>
                                    <option>40대</option>
                                    <option>50대 이상</option>
                                </Select>
                            </InputGroup>
                            <InputGroup label="성별" htmlFor="gender">
                                <Select id="gender" value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                                    <option>무관</option>
                                    <option>남성</option>
                                    <option>여성</option>
                                </Select>
                            </InputGroup>
                        </div>
                        
                        <InputGroup label="건강 상태 또는 질병 (중복 선택 가능)" htmlFor="healthConditions">
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 p-4 rounded-lg border border-stone-200 bg-orange-50/50">
                                {commonHealthConditions.map((condition) => (
                                    <label key={condition} className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-stone-800 hover:text-orange-600 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="healthCondition"
                                            value={condition}
                                            checked={selectedHealthConditions.includes(condition)}
                                            onChange={(e) => {
                                                const { value, checked } = e.target;
                                                setSelectedHealthConditions(prev =>
                                                    checked ? [...prev, value] : prev.filter(item => item !== value)
                                                );
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span>{condition}</span>
                                    </label>
                                ))}
                           </div>
                           <div className="mt-3">
                                <TextInput
                                    id="otherHealthCondition"
                                    value={otherHealthCondition}
                                    onChange={(e) => setOtherHealthCondition(e.target.value)}
                                    placeholder="기타 사항을 직접 입력하세요 (예: 임산부)"
                                />
                           </div>
                        </InputGroup>

                        <InputGroup label="알레르기" htmlFor="allergies">
                             <TextInput id="allergies" value={formData.allergies} onChange={e => handleChange('allergies', e.target.value)} placeholder="예: 갑각류, 견과류, 유제품" />
                        </InputGroup>

                        <InputGroup label="현재 보유중인 식재료" htmlFor="ingredients">
                            <TextInput id="ingredients" value={formData.ingredients} onChange={e => handleChange('ingredients', e.target.value)} placeholder="쉼표(,)로 구분하여 입력해주세요. 예: 돼지고기, 양파, 계란" />
                        </InputGroup>
                        
                        <div>
                            <span className="block text-sm font-medium text-stone-700 mb-2">레시피 종류</span>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="recipeType" value="any" checked={formData.recipeType === 'any'} onChange={() => handleChange('recipeType', 'any')} className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300" />
                                    <span>자유롭게 추천</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="recipeType" value="have" checked={formData.recipeType === 'have'} onChange={() => handleChange('recipeType', 'have')} className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300" />
                                    <span>보유 재료만 사용</span>
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform transition-all duration-300 ease-in-out disabled:from-orange-300 disabled:to-red-300 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    레시피 생성 중...
                                </>
                            ) : (
                                "AI 레시피 추천받기"
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12">
                    {isLoading && <Spinner />}
                    {error && (
                        <div className="max-w-3xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-lg" role="alert">
                            <p className="font-bold">오류 발생!</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {!isLoading && recipes.length > 0 && (
                        <div className="grid grid-cols-1 gap-8 md:gap-12">
                           {recipes.map((recipe, index) => (
                               <RecipeCard key={index} recipe={recipe} index={index} />
                           ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;