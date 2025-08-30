
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      recipeName: {
        type: Type.STRING,
        description: "요리의 이름",
      },
      description: {
        type: Type.STRING,
        description: "요리에 대한 간단하고 흥미로운 설명",
      },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "요리에 필요한 재료 목록",
      },
      instructions: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "요리 과정을 단계별로 설명하는 목록",
      },
    },
    required: ["recipeName", "description", "ingredients", "instructions"],
  },
};


export interface RecipeRequest {
    age: string;
    gender: string;
    healthConditions: string;
    allergies: string;
    ingredients: string;
    recipeType: 'have' | 'any';
}

export const generateRecipes = async (request: RecipeRequest): Promise<Recipe[]> => {
    const { age, gender, healthConditions, allergies, ingredients, recipeType } = request;
    
    const recipeTypeInstruction = recipeType === 'have' 
        ? "반드시 '보유 재료' 목록에 있는 재료만을 사용하여 만들 수 있는 레시피를 제안해야 합니다. 다른 재료는 절대 추가하면 안 됩니다."
        : "보유 재료를 최대한 활용하되, 더 맛있는 요리를 위해 추가적인 재료가 필요한 레시피를 제안해도 좋습니다.";

    const prompt = `
        당신은 창의적인 셰프이자 전문 영양사입니다. 다음 사용자의 프로필과 요구사항에 맞춰, 맛있고 건강한 레시피 3가지를 추천해주세요.
        결과는 반드시 제공된 JSON 스키마에 따라 유효한 JSON 형식으로만 출력해야 합니다. 어떠한 설명이나 추가 텍스트 없이 JSON 데이터만 반환해주세요.

        **사용자 프로필:**
        - 연령대: ${age}
        - 성별: ${gender}
        - 건강 관련 특이사항: ${healthConditions || '없음'}
        - 알레르기 정보: ${allergies || '없음'}

        **레시피 요구사항:**
        - 보유 재료: ${ingredients || '없음'}
        - 레시피 종류: ${recipeTypeInstruction}

        각 레시피는 독창적인 이름, 간단한 설명, 재료 목록, 그리고 명확한 단계별 조리법을 포함해야 합니다.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const recipes = JSON.parse(jsonText) as Recipe[];
        return recipes;

    } catch (error) {
        console.error("Gemini API 호출 중 오류 발생:", error);
        throw new Error("레시피를 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
};
