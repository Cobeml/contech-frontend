interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: 'Cobe Liu',
    role: 'Lead Frontend Engineer',
    image: '/team/cobe.jpg', // Add team member images to public/team/
    linkedin: 'https://www.linkedin.com/in/cobe-liu-436579251/',
  },
  {
    name: 'Ajay Bhargava',
    role: 'Full Stack Engineer',
    image: '/team/ajay.jpg',
    linkedin: 'https://www.linkedin.com/in/ajaybhargava/',
  },
  {
    name: 'Daniel Gorbachev',
    role: 'Integrations Engineer',
    image: '/team/daniel.jpg',
    linkedin: 'https://www.linkedin.com/in/danielgorbachev1/',
  },
  {
    name: 'Karan Vora',
    role: 'Lead Backend Engineer',
    image: '/team/karan.jpg',
    linkedin: 'https://www.linkedin.com/in/karan-vora-574961188/',
  },
];
