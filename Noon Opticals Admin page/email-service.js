/**
 * =============================================
 * Admin Email Service Module
 * Sends emails to customers using Web3Forms (FREE)
 * Order confirmations, Shipping notifications, etc.
 * =============================================
 */

const AdminEmailService = {
    // Web3Forms Configuration - Same key as website
    ACCESS_KEY: '4ad7f3b0-135d-4104-bf63-5975a8948189',
    
    // Business info
    FROM_EMAIL: 'noonopticals@gmail.com',
    FROM_NAME: 'NOON Opticals',

    /**
     * Check if Email Service is configured
     */
    isConfigured() {
        return this.ACCESS_KEY !== 'YOUR_ACCESS_KEY';
    },

    /**
     * Send email using Web3Forms API
     */
    async sendEmail(toEmail, toName, subject, message) {
        if (!this.isConfigured()) {
            console.warn('📧 Email service not configured');
            return { success: false, error: 'Not configured' };
        }

        if (!toEmail) {
            console.warn('📧 No email address provided');
            return { success: false, error: 'No email' };
        }

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: this.ACCESS_KEY,
                    to: toEmail,
                    from_name: this.FROM_NAME,
                    subject: subject,
                    message: message,
                    replyto: this.FROM_EMAIL
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('📧 ✅ Email sent to:', toEmail);
                return { success: true };
            } else {
                console.error('📧 ❌ Email failed:', result.message);
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('📧 ❌ Email error:', error);
            return { success: false, error };
        }
    },

    /**
     * Send Order Confirmed Email (Admin confirmed the order)
     */
    async sendOrderConfirmed(email, name, orderDetails) {
        const userName = name || email.split('@')[0];
        const subject = `Order Confirmed - ${orderDetails.orderId} ✅`;
        
        const message = `
Hello ${userName},

Great news! Your order has been confirmed by our team! 🎉

📦 ORDER DETAILS
━━━━━━━━━━━━━━━━
Order ID: ${orderDetails.orderId}
Products: ${orderDetails.products || 'N/A'}
Amount: ₹${orderDetails.amount?.toLocaleString() || 'N/A'}

Your order is now being processed and will be shipped soon.
We'll send you another email once it's on its way!

Thank you for shopping with us!

Best regards,
The NOON Opticals Team
        `.trim();

        return await this.sendEmail(email, userName, subject, message);
    },

    /**
     * Send Order Processing Email
     */
    async sendOrderProcessing(email, name, orderDetails) {
        const userName = name || email.split('@')[0];
        const subject = `Order Being Processed - ${orderDetails.orderId} ⚙️`;
        
        const message = `
Hello ${userName},

Your order is now being processed! 📦

📦 ORDER DETAILS
━━━━━━━━━━━━━━━━
Order ID: ${orderDetails.orderId}
Products: ${orderDetails.products || 'N/A'}
Amount: ₹${orderDetails.amount?.toLocaleString() || 'N/A'}

Our team is preparing your eyewear with care.
We'll notify you once it ships!

Thank you for your patience!

Best regards,
The NOON Opticals Team
        `.trim();

        return await this.sendEmail(email, userName, subject, message);
    },

    /**
     * Send Order Shipped Email
     */
    async sendOrderShipped(email, name, orderDetails) {
        const userName = name || email.split('@')[0];
        const subject = `Your Order is On Its Way! 🚚 - ${orderDetails.orderId}`;
        
        const message = `
Hello ${userName},

Exciting news! Your order has been shipped! 🎉

📦 SHIPPING DETAILS
━━━━━━━━━━━━━━━━━━
Order ID: ${orderDetails.orderId}
Products: ${orderDetails.products || 'N/A'}
Amount: ₹${orderDetails.amount?.toLocaleString() || 'N/A'}

${orderDetails.trackingNumber ? `Tracking Number: ${orderDetails.trackingNumber}` : ''}
${orderDetails.carrier ? `Carrier: ${orderDetails.carrier}` : ''}
Estimated Delivery: 3-5 business days

Your package is on its way to you!

Thank you for shopping with us!

Best regards,
The NOON Opticals Team
        `.trim();

        return await this.sendEmail(email, userName, subject, message);
    },

    /**
     * Send Order Delivered Email
     */
    async sendOrderDelivered(email, name, orderDetails) {
        const userName = name || email.split('@')[0];
        const subject = `Order Delivered! 🎉 - ${orderDetails.orderId}`;
        
        const message = `
Hello ${userName},

Your order has been delivered! 📦✅

📦 ORDER DETAILS
━━━━━━━━━━━━━━━━
Order ID: ${orderDetails.orderId}
Products: ${orderDetails.products || 'N/A'}

We hope you love your new eyewear! 

If you have any questions or concerns about your order, 
please don't hesitate to reach out to us.

We'd love to hear your feedback! 
Consider leaving a review on our website.

Thank you for choosing NOON Opticals!

Best regards,
The NOON Opticals Team
        `.trim();

        return await this.sendEmail(email, userName, subject, message);
    },

    /**
     * Send Payment Received Email
     */
    async sendPaymentReceived(email, name, orderDetails) {
        const userName = name || email.split('@')[0];
        const subject = `Payment Received - ${orderDetails.orderId} 💳`;
        
        const message = `
Hello ${userName},

Thank you! We have received your payment. ✅

📦 ORDER DETAILS
━━━━━━━━━━━━━━━━
Order ID: ${orderDetails.orderId}
Amount Paid: ₹${orderDetails.amount?.toLocaleString() || 'N/A'}
Payment Status: Paid ✓

Your order will be processed and shipped soon!

Thank you for shopping with us!

Best regards,
The NOON Opticals Team
        `.trim();

        return await this.sendEmail(email, userName, subject, message);
    },

    /**
     * Send Custom Email to Customer
     */
    async sendCustomEmail(email, name, subject, customMessage) {
        const userName = name || email.split('@')[0];
        
        const message = `
Hello ${userName},

${customMessage}

Best regards,
The NOON Opticals Team
        `.trim();

        return await this.sendEmail(email, userName, subject, message);
    }
};

// Make available globally
window.AdminEmailService = AdminEmailService;
