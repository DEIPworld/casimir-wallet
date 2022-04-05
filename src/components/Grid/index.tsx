// Lib
import { defineComponent } from 'vue';

// Components
import GridCell from './GridCell';

// Styles
import './styles.scss';

const Grid = defineComponent({
  name: 'Grid',

  render() {
    return (
      <div class="grid">
        <slot/>
      </div>
    );
  },
});

export { GridCell };
export default Grid;
