import { defineComponent } from 'vue';
import { VBtn, VSpacer } from 'vuetify/components';

export const AccountOAuthUnsigned = defineComponent({
  emits: [
    'click:import',
    'click:create'
  ],

  setup(props, { emit }) {
    return () => (
      <>
        <div class="text-h3 mb-6">
          There is a problem
        </div>

        <div class="text-body-large mb-12">
          To grant an access for Portal you must be logged in.
        </div>

        <div class="d-flex mt-12">
          <VSpacer/>

          <VBtn
            color="secondary-btn"
            onClick={() => emit('click:import')}
          >
            Import existing account
          </VBtn>
          <VBtn
            class="ml-4"
            onClick={() => emit('click:create')}
          >
            Create account
          </VBtn>
        </div>
      </>
    );
  }

});
