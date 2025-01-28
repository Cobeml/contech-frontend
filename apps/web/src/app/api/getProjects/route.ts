import { createClient } from '@repo/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createClient();

  // Get userId from the URL
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('project_overview')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform the data to match our ProjectOverview type
  const projects = data.map((project) => ({
    projectId: project.project_id,
    userId: project.user_id,
    imageUrl: project.image_url,
    name: project.name,
    description: project.description,
  }));

  return NextResponse.json(projects);
}
