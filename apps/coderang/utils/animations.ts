function generateAnimation({
  name,
  steps,
  initial,
  visible,
}: {
  name: string;
  steps: number;
  initial: { opacity?: number; x?: string; y?: string };
  visible: { opacity?: number; x?: string; y?: string };
}) {
  const keyframes = new Map<string, { opacity: string; transform: string }>();

  keyframes.set('0%', {
    opacity: (initial.opacity ?? 0).toString(),
    transform: `translate(${initial.x ?? 0}, ${initial.y ?? 0})`,
  });

  for (let step = 0; step < steps; step++) {
    keyframes.set(`${(100 * (step + 1)) / steps}%`, {
      opacity: `var(--${name}-opacity-step-${step})`,
      transform: `translate(var(--${name}-x-step-${step}), var(--${name}-y-step-${step}))`,
    });
  }

  function getVariables(activeStep: number) {
    const variables = new Map<string, string | number>();
    for (let step = 0; step < steps; step++) {
      const value = step >= activeStep ? visible : initial;
      variables.set(`--${name}-opacity-step-${step}`, value.opacity ?? 0);
      variables.set(`--${name}-x-step-${step}`, value.x ?? 0);
      variables.set(`--${name}-y-step-${step}`, value.y ?? 0);
    }
    return Object.fromEntries(variables);
  }

  return {
    name,
    keyframes: Object.fromEntries(keyframes),
    getVariables,
  };
}

export const TextAnimation = generateAnimation({
  name: 'hero-text-reveal',
  steps: 4,
  initial: {
    opacity: 0,
    y: '25px',
  },
  visible: {
    opacity: 1,
    y: '0px',
  },
});
