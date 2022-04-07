// Lib
import { defineComponent } from 'vue';

// Styles
import './styles.scss';

export const DwGrid = defineComponent({
  name: 'DwGrid',

  render() {
    return (
      <div class="grid">
        <slot/>
      </div>
    );
  }
});
