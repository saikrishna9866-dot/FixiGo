import { supabase } from './supabase';
import { fallbackCategories, fallbackServices } from '../data/fallbackData';

export const seedDatabase = async () => {
  try {
    // 1. Insert categories
    const categoriesToInsert = fallbackCategories.map(c => ({ name: c.name }));
    const { data: insertedCategories, error: catError } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select();

    if (catError) throw catError;

    // Create a map of category name to new ID
    const categoryMap = new Map(insertedCategories.map(c => [c.name, c.id]));

    // 2. Insert services
    const servicesToInsert = fallbackServices.map(s => ({
      category_id: categoryMap.get(s.categories.name),
      title: s.title,
      description: s.description,
      image_url: s.image_url
    }));

    const { error: serError } = await supabase
      .from('services')
      .insert(servicesToInsert);

    if (serError) throw serError;

    return { success: true };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
};
