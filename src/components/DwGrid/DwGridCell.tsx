// Lib
import { defineComponent } from 'vue';

// Styles
import './styles.scss';

export const DwGridCell = defineComponent({
  name: 'DwGridCell',

  render() {
    return (
      <div class="grid__cell">
        <slot/>
      </div>
    );
  }
});
