export interface StackGroup {
  titleEn: string;
  titlePt: string;
  items: string[];
}

export const stack: StackGroup[] = [
  { titleEn: 'Frontend', titlePt: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Vue', 'Storybook', 'Playwright'] },
  { titleEn: 'Backend', titlePt: 'Backend', items: ['FastAPI', 'Node.js', 'Express.js', 'Django'] },
  { titleEn: 'Architecture', titlePt: 'Arquitetura', items: ['REST APIs', 'Microservices', 'CI/CD', 'Clean Architecture', 'Test Automation'] },
  { titleEn: 'Cloud & DevOps', titlePt: 'Cloud & DevOps', items: ['AWS (Lambda, EC2, S3)', 'Docker', 'Kubernetes', 'GitHub Actions', 'ArgoCD'] },
  { titleEn: 'Databases', titlePt: 'Bancos de dados', items: ['PostgreSQL', 'MySQL', 'SQL Server'] },
  { titleEn: 'Monitoring', titlePt: 'Monitoramento', items: ['Sentry', 'PostHog', 'Metabase'] },
];
