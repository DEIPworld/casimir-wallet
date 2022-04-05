// Lib
import { defineComponent } from 'vue';

// Styles
import './styles.scss';

const GridCell = defineComponent({
  name: 'GridCell',

  render() {
    return (
      <div class="grid__cell">
        <slot/>
      </div>
    );
  },
});

export default GridCell;
