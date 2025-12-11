import { GoogleGenAI } from "@google/genai";
import { Product, Operation, AIInsight } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeInventory = async (products: Product[], operations: Operation[]): Promise<AIInsight[]> => {
  try {
    const ai = getClient();
    
    // Prepare a simplified context to save tokens
    const inventoryContext = products.map(p => ({
      name: p.name,
      sku: p.sku,
      qty: p.quantity,
      min: p.minLevel,
      value: p.price
    }));

    const prompt = `
      Analyze this inventory data for a warehouse management system.
      Identify critical issues such as stockouts, low stock (below min level), or overstocking.
      Also look for potential shipping delays based on pending operations (mock logic).
      
      Return a valid JSON array of objects with these keys:
      - type: 'warning' | 'suggestion' | 'success'
      - message: A short, actionable insight string.
      - action: (Optional) A button label for the user (e.g., "Reorder Now", "Check Schedule").

      Data: ${JSON.stringify(inventoryContext)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text) as AIInsight[];
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return [
      { type: 'warning', message: 'AI Analysis currently unavailable. Check API Key.', action: 'Retry' }
    ];
  }
};
