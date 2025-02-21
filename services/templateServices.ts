import { supabase } from "@/lib/supabase"
import { ExtendedTemplateWithCreator } from "@/types/extended-types"

  // function to get all the templates
  export const getUserTemplates = async (userId: string): Promise<ExtendedTemplateWithCreator[]> => {  
    const { data: templates, error: templateError } = await supabase
      .from('TemplateUser')
      .select(`
        template:Template (
          *,
          creator:profiles!Template_creatorUserId_fkey (
            *
          )
        )
      `)
      .eq('user_id', userId)
  
    if (templateError) {
      throw new Error(`Error fetching templates: ${templateError.message}`)
    }
  
    if (!templates?.length) {
      return []
    }
  
    // Transform templates and parse data
    const parsedTemplates: ExtendedTemplateWithCreator[] = templates.map(tu => {
      const template = tu.template as any // temporary any for raw template
      
      return {
        ...template,
        data: template.data ? JSON.parse(template.data) : [],
        creator: {
          profile: template.creator
        }
      }
    })
  
    return parsedTemplates
  }