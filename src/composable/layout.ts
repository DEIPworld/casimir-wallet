// import { useDisplay } from 'vuetify';

export function useLayout() {
  // const { xs, sm, md, lg, xl, xxl, mdAndUp } = useDisplay();
  const mainGapMap: Record<string, number> = {
    xs: 6,
    md: 12,
    lg: 18
  };

  const getMainGap = (prop = 'pa') => {
    return Object.keys(mainGapMap)
      .reduce<string[]>((acc, key) => {
        const infix = key === 'xs' ? '' : `-${key}`;
        const className = `${prop}${infix}-${mainGapMap[key]}`;

        return [...acc, className];
      }, <string[]>[]).join(' ');
  };

  return {
    getMainGap
  };
}
