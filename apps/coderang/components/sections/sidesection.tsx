import clsx from 'clsx';
import { Grid } from '../layout/grid';

function SideSection() {
  return (
    <Grid className={clsx('lg: mb-24 h-auto pt-24 lg:min-h-[40rem] lg:pb-12', {})}>
      <div>hello</div>
    </Grid>
  );
}

export default SideSection;
