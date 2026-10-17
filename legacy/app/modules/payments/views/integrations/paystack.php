<div id="main-modal-content">
  <div class="modal-right">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <?php
          $id = (!empty($payment->id))? $payment->id: '';
          if ($id != "") {
            $url = cn($module."/ajax_update/$id");
          }else{
            $url = cn($module."/ajax_update");
          }
        ?>
        <form class="form actionForm" action="<?php echo $url?>" data-redirect="<?php echo cn($module); ?>" method="POST">
          <div class="modal-header bg-pantone">
            <h4 class="modal-title"><i class="fa fa-edit"></i> <?php echo $payment->name; ?></h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            </button>
          </div>
          <div class="modal-body">
            <div class="form-body">
              <div class="row justify-content-md-center">

                <div class="col-md-12 col-sm-12 col-xs-12">
                  <div class="form-group">
                    <label class="form-label">Method Name</label>
                    <input type="hidden" class="form-control square" name="payment_params[type]" value="paystack">
                    <input type="text" class="form-control square" name="payment_params[name]" value="<?php echo (!empty($payment->name))? $payment->name : 'Paystack Checkout' ; ?>">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Minimal Payment</label>
                    <input type="number" class="form-control square" name="payment_params[min]" value="<?php echo (!empty($payment->min))? $payment->min : '1' ; ?>">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Maximal Payment</label>
                    <input type="number" class="form-control square" name="payment_params[max]" value="<?php echo (!empty($payment->max))? $payment->max : '1000' ; ?>">
                  </div>
                </div>

                <?php
                  $payment_params = json_decode($payment->params);
                  $option = isset($payment_params->option) ? $payment_params->option : new stdClass();
                ?>

                <div class="col-md-12">
                  <hr>
                  <div class="form-group">
                    <label class="form-label">Environment</label>
                    <select name="payment_params[option][environment]" class="form-control square">
                      <option value="sandbox" <?php echo (isset($option->environment) && $option->environment == 'sandbox') ? 'selected' : ''; ?>>Sandbox (Test)</option>
                      <option value="live" <?php echo (isset($option->environment) && $option->environment == 'live') ? 'selected' : ''; ?>>Live</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Paystack Public Key<span class="form-required">*</span></label>
                    <input type="text" class="form-control" name="payment_params[option][public_key]" value="<?php echo (isset($option->public_key)) ? $option->public_key : ''; ?>">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Paystack Secret Key<span class="form-required">*</span></label>
                    <input type="text" class="form-control" name="payment_params[option][secret_key]" value="<?php echo (isset($option->secret_key)) ? $option->secret_key : ''; ?>">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Currency (Fixed to GHS)</label>
                    <input type="text" class="form-control" value="GHS" readonly>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn round btn-primary btn-min-width mr-1 mb-1">Submit</button>
            <button type="button" class="btn round btn-default btn-min-width mr-1 mb-1" data-dismiss="modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
