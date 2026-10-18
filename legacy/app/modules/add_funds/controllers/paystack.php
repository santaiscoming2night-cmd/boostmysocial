<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Paystack extends MX_Controller {
    public $tb_users;
    public $tb_transaction_logs;
    public $tb_payments;
    public $tb_payments_bonuses;
    public $payment_type;
    public $payment_id;
    public $currency_code;
    public $mode;
    public $secret_key;
    public $public_key;
    public $take_fee_from_user;

    public function __construct($payment = ""){
        parent::__construct();
        $this->load->model('add_funds_model', 'model');

        $this->tb_users            = USERS;
        $this->payment_type        = 'paystack';
        $this->tb_transaction_logs = TRANSACTION_LOGS;
        $this->tb_payments         = PAYMENTS_METHOD;
        $this->tb_payments_bonuses = PAYMENTS_BONUSES;
        $this->currency_code       = 'USD'; // base currency (convert later)

        if (!$payment) {
            $payment = $this->model->get('id, type, name, params', $this->tb_payments, ['type' => $this->payment_type]);
        }

        if ($payment) {
            $this->payment_id = $payment->id;
            $params  = $payment->params;
            $option  = get_value($params, 'option');
            $this->mode             = get_value($option, 'environment');
            $this->take_fee_from_user = get_value($params, 'take_fee_from_user');
            $this->public_key       = get_value($option, 'public_key');
            $this->secret_key       = get_value($option, 'secret_key');
        }
    }

    /**
     * Show Paystack payment form
     */
    public function index($payment_id = "")
    {
        $payment = $this->model->get('*', $this->tb_payments, ['id' => $payment_id]);
        $data = [
            "payment_id"      => $payment->id,
            "payment_params"  => $payment->params,
            "currency_code"   => "GHS", // force GHS
            "currency_symbol" => "₵",
        ];
        $this->load->view('add_funds/paystack/index', $data);
    }

    /**
     * Initialize Paystack payment
     */
    public function create_payment($data_payment = ""){
        _is_ajax($data_payment['module']);
        $amountUSD = $data_payment['amount'];

        if (!$amountUSD) {
            _validation('error', lang('There_was_an_error_processing_your_request_Please_try_again_later'));
        }

        if (!$this->secret_key || !$this->public_key) {
            _validation('error', lang('this_payment_is_not_active_please_choose_another_payment_or_contact_us_for_more_detail'));
        }

        $users = session('user_current_info');

        // Get conversion rate from DB general_options (fallback to 12)
$conversion_rate = (float) get_option('usd_to_ghs_rate', 12);
if ($conversion_rate <= 0) {
    $conversion_rate = 12; // safe fallback
}

// Convert USD to GHS then to pesewas (lowest unit)
$amountGHS = $amountUSD * $conversion_rate;
$paystackAmount = (int) round($amountGHS * 100);


        // Log transaction
        $data_tnx_log = [
            "ids"               => ids(),
            "uid"               => session("uid"),
            "type"              => $this->payment_type,
            "transaction_id"    => '',
            "amount"            => $amountUSD,
            "status"            => 0,
            "created"           => NOW,
        ];
        $this->db->insert($this->tb_transaction_logs, $data_tnx_log);
        $transaction_id = $this->db->insert_id();

        $callback_url = cn("add_funds/paystack/complete/".$transaction_id);

        // Call Paystack
        $postdata = [
            "email" => $users['email'],
            "amount" => $paystackAmount,
            "currency" => "GHS",
            "callback_url" => $callback_url
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.paystack.co/transaction/initialize");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postdata));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $this->secret_key,
            "Cache-Control: no-cache",
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $result = curl_exec($ch);
        curl_close($ch);

        $response = json_decode($result);

        if (isset($response->status) && $response->status == true) {
            $this->db->update($this->tb_transaction_logs, ["transaction_id" => $response->data->reference], ["id" => $transaction_id]);

            if ($this->input->is_ajax_request()) {
                ms(['status' => 'success', 'redirect_url' => $response->data->authorization_url]);
            }
        } else {
            _validation('error', "Paystack init failed: " . json_encode($response));
        }
    }

    /**
     * Verify and complete payment
     */
    public function complete($transaction_id = null){
        if (!$transaction_id || !isset($_GET['reference'])) {
            redirect(cn("add_funds/unsuccess"));
        }

        $reference = $_GET['reference'];

        // Verify with Paystack
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.paystack.co/transaction/verify/" . $reference);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $this->secret_key,
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $result = curl_exec($ch);
        curl_close($ch);

        $response = json_decode($result);

        $transaction = $this->model->get('*', $this->tb_transaction_logs, [
            'id' => $transaction_id,
            'status' => 0,
            'type' => $this->payment_type
        ]);

        if (!$transaction) {
            redirect(cn("add_funds"));
        }

        if ($response && $response->status && $response->data->status == "success") {
            $data_tnx_log = [
                "transaction_id" => $reference,
                "status" => 1,
                "payer_email" => $response->data->customer->email,
                "txn_fee" => 0,
            ];
            $this->db->update($this->tb_transaction_logs, $data_tnx_log, ['id' => $transaction->id]);

            // Add funds
            require_once 'add_funds.php';
            $add_funds = new add_funds();
            $add_funds->add_funds_bonus_email($transaction, $this->payment_id);

            set_session("transaction_id", $transaction->id);
            redirect(cn("add_funds/success"));
        } else {
            redirect(cn("add_funds/unsuccess"));
        }
    }
}
