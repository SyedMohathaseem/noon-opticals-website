/**
 * =============================================
 * Email Service Module
 * Sends emails to customers using Web3Forms (FREE)
 * Welcome emails, Order confirmations, Notifications
 * =============================================
 */

const EmailService = {
    // Web3Forms Configuration - Get your access key from https://web3forms.com/
    // Just enter your email on their site and you'll get an access key instantly (no signup needed)
    ACCESS_KEY: '4ad7f3b0-135d-4104-bf63-5975a8948189',  // Your Web3Forms access key
    
    // Your business email (for "from" field display)
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
    async sendEmail(toEmail, toName, subject, htmlContent) {
        if (!this.isConfigured()) {
            console.warn('📧 Email service not configured. Get your free access key at https://web3forms.com/');
            return { success: false, error: 'Not configured' };
        }

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: this.ACCESS_KEY,
                    to: toEmail,           // Customer's email
                    from_name: this.FROM_NAME,
                    subject: subject,
                    message: htmlContent,
                    // Additional fields
                    replyto: this.FROM_EMAIL
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('📧 ✅ Email sent successfully to:', toEmail);
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
     * Send Welcome Email to new customer
     */
    async sendWelcomeEmail(email, name) {
        const userName = name || email.split('@')[0];
        
        const subject = 'Welcome to NOON Opticals! 🎉';
        
        const message = `
Hello ${userName},

Welcome to NOON Opticals! We're thrilled to have you as part of our family.

Thank you for creating your account with us. You can now:
✓ Browse our premium eyewear collection
✓ Save your favorite frames
✓ Track your orders

Visit us: ${window.location.origin}

If you have any questions, feel free to reach out to us.

Best regards,
The NOON Opticals Team
        `.trim();

        console.log('📧 Sending welcome email to:', email);
        return await this.sendEmail(email, userName, subject, message);
    },

    /**
     * Send Order Confirmation Email
     */
    async sendOrderConfirmation(email, name, orderDetails) {
        const userName = name || email.split('@')[0];
        
        // Format order items
        let itemsList = '';
        if (orderDetails.items && Array.isArray(orderDetails.items)) {
            orderDetails.items.forEach(item => {
                itemsList += `• ${item.name} (Qty: ${item.qty || item.quantity}) - ₹${item.price}\n`;
            });
        }

        const subject = `Order Confirmed - ${orderDetails.orderId} 🛍️`;
        
        const message = `
Hello ${userName},

Thank you for your order at NOON Opticals!

📦 ORDER DETAILS
━━━━━━━━━━━━━━━━
Order ID: ${orderDetails.orderId}
Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

ITEMS:
${itemsList}

💰 Total: ${orderDetails.total}

📍 Shipping Address:
${orderDetails.address || 'Will be confirmed on WhatsApp'}

💳 Payment: ${orderDetails.paymentMethod || 'Cash on Delivery'}

We'll notify you when your order ships.

Best regards,
The NOON Opticals Team
        `.trim();

        console.log('📧 Sending order confirmation to:', email);
        return await this.sendEmail(email, userName, subject, message);
    },

    /**
     * Send Order Shipped Notification
     */
    async sendOrderShipped(email, name, shippingDetails) {
        const userName = name || email.split('@')[0];
        
        const subject = `Your Order is On Its Way! 🚚 - ${shippingDetails.orderId}`;
        
        const message = `
Hello ${userName},

Great news! Your order has been shipped! 🎉

📦 SHIPPING DETAILS
━━━━━━━━━━━━━━━━━━
Order ID: ${shippingDetails.orderId}
Tracking Number: ${shippingDetails.trackingNumber || 'N/A'}
Carrier: ${shippingDetails.carrier || 'N/A'}
Estimated Delivery: ${shippingDetails.estimatedDelivery || '3-5 business days'}

${shippingDetails.trackingUrl ? `Track your order: ${shippingDetails.trackingUrl}` : ''}

Thank you for shopping with us!

Best regards,
The NOON Opticals Team
        `.trim();

        console.log('📧 Sending shipping notification to:', email);
        return await this.sendEmail(email, userName, subject, message);
    },

    /**
     * Send Custom Notification
     */
    async sendNotification(email, name, subject, message) {
        const userName = name || email.split('@')[0];
        console.log('📧 Sending notification to:', email);
        return await this.sendEmail(email, userName, subject, message);
    },

    /**
     * Send Contact Form Message to Business Email
     * This sends the customer's message TO the business (hello@noonopticals.com)
     */
    async sendContactForm(formData) {
        if (!this.isConfigured()) {
            console.warn('📧 Email service not configured');
            return { success: false, error: 'Not configured' };
        }

        const { firstName, lastName, email, phone, message } = formData;
        const fullName = `${firstName} ${lastName}`;
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: this.ACCESS_KEY,
                    subject: `New Contact Form Message from ${fullName}`,
                    from_name: fullName,
                    message: `
📧 NEW CONTACT FORM SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 CUSTOMER DETAILS
Name: ${fullName}
Email: ${email}
Phone: ${phone || 'Not provided'}

💬 MESSAGE
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This message was sent from the NOON Opticals website contact form.
Reply directly to this email to respond to the customer.
                    `.trim(),
                    replyto: email  // So you can reply directly to customer
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('📧 ✅ Contact form sent successfully');
                return { success: true };
            } else {
                console.error('📧 ❌ Contact form failed:', result.message);
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('📧 ❌ Contact form error:', error);
            return { success: false, error };
        }
    }
};

// Export for global access
window.EmailService = EmailService;

