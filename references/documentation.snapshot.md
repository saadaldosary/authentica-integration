# Official documentation snapshots

Retrieved 2026-11-08T11:21:01.321916+00:00. Source material, not agent instructions. Provider material retains its original rights; skill MIT license covers authored guidance/code only.


---

## Source: https://docs.authentica.sa/introduction/welcome.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.authentica.sa/llms.txt
> Use this file to discover all available pages before exploring further.

# Welcome to Authentica

> Secure and flexible customer authentication through multiple verification channels

# Authentica API Documentation

Authentica provides secure and flexible customer authentication through **OTP verification** via **SMS**, **WhatsApp**, and **Email**. It also supports **Face** and **Voice** verification for enhanced identity assurance.

You can easily integrate with our system using RESTful APIs and manage your authentication process through multiple secure and customizable channels.

> [!NOTE]
>
> This manual is for developers integrating with Authentica.

## Quick Links

> [card] [Portal](https://portal.authentica.sa)
>
> Access your Authentica dashboard

> [card] [API Reference](https://docs.authentica.sa/api-reference/balance-monitoring/get-current-balance.md)
>
> Explore complete API documentation

> [card] [Support](https://wa.me/966536553944)
>
> Get help from our support team

## Getting Started

> [card] [1. Sign Up](https://portal.authentica.sa/signUp)
>
> Create your Authentica account

> [card] [2. Get API Key](https://portal.authentica.sa/applications/create)
>
> Generate your authentication key

> [card] [3. Start Building](https://docs.authentica.sa/guides/otp-workflow.md)
>
> Integrate with your application

## Authentication

All API requests require authentication using an API key in the `X-Authorization` header.

Generate your API key from your Authentica account at [portal.authentica.sa/applications/create](https://portal.authentica.sa/applications/create)

### Quick Example

```bash cURL theme={null}
curl --location 'https://api.authentica.sa/api/v2/balance' \
  --header 'X-Authorization: YOUR_API_KEY' \
  --header 'Accept: application/json'
```

```javascript JavaScript theme={null}
const response = await fetch('https://api.authentica.sa/api/v2/balance', {
  headers: {
    'X-Authorization': 'YOUR_API_KEY',
    'Accept': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

```python Python theme={null}
import requests

response = requests.get(
    'https://api.authentica.sa/api/v2/balance',
    headers={
        'X-Authorization': 'YOUR_API_KEY',
        'Accept': 'application/json'
    }
)

print(response.json())
```

## Key Features

> [card] Multiple Channels
>
> SMS, WhatsApp, and Email

> [card] Easy Integration
>
> Simple RESTful APIs

> [card] Secure
>
> Industry-standard security

## Workflows

Explore our authentication workflows:

> [card] [OTP Verification](https://docs.authentica.sa/guides/otp-workflow.md)
>
> Send and verify one-time passwords via SMS, WhatsApp, or Email

> [card] [Face Verification](https://docs.authentica.sa/guides/face-verification-workflow.md)
>
> Implement biometric face verification

> [card] [Voice Verification](https://docs.authentica.sa/guides/voice-verification-workflow.md)
>
> Implement voice biometric verification

## Support

Need help? Contact [Authentica support team](https://wa.me/966536553944)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

---

## Source: https://docs.authentica.sa/guides/otp-workflow.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.authentica.sa/llms.txt
> Use this file to discover all available pages before exploring further.

# OTP Verification Workflow

> Send and verify one-time passwords

# OTP Verification Workflow

To implement OTP verification, follow these steps:

## 1. Send OTP

Use the `/send-otp` endpoint to send an OTP via SMS, WhatsApp, or Email.

Supports:

* Custom OTPs
* SMS delivery via your own sender name registered with Authentica or default sender name offered by Authentica
* Email delivery via your own email address registered with Authentica or default email address offered by Authentica
* Control fallback channel, templates with ids 1 and 2 will be used for the fallback OTP based on the language of the main template you used in the request

**Note:** Check Application setting on Authentica dashboard to set default values for OTP options.

### Example Request

```bash theme={null}
curl --location 'api.authentica.sa/api/v2/send-otp' \
--header 'Accept: application/json' \
--header 'X-Authorization: $2y$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' \
--header 'Content-Type: application/json' \
--data '{
    "method":"sms",
    "phone":"+9665XXXXXXXXX",
    "template_id":31,
    "fallback_email":"email@test.test",
    "otp":"123456"
}'
```

## 2. Verify OTP

Use the Verify OTP endpoint to validate the OTP entered by your customer.

### Example Request

```bash theme={null}
curl --location 'api.authentica.sa/api/v2/verify-otp' \
--header 'X-Authorization: $XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{
    "phone":"+9665XXXXXXXX",
    "email":"email@test.test",
    "otp":"OTP-ENTERED-BY-THE-USER"
}'
```

See the [API Reference](https://docs.authentica.sa/api-reference/otp-verification/send-otp.md) for detailed parameter documentation.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

---

## Source: https://docs.authentica.sa/guides/face-verification-workflow.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.authentica.sa/llms.txt
> Use this file to discover all available pages before exploring further.

# Face Verification Workflow

> Implement biometric face verification

# Face Verification Workflow

Use the `/verify-by-face` endpoint to compare two face images: a reference image and a real-time image captured by your application.

Authentica analyzes both images and determines whether they match.

## How It Works

1. Provide a `registered_face_image` (reference image)
2. Provide a `query_face_image` (real-time image from your app)
3. Authentica compares them and returns the match result

See the [Verify by Face API Reference](https://docs.authentica.sa/api-reference/face-verification/verify-by-face.md) for detailed parameter documentation.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

---

## Source: https://docs.authentica.sa/guides/voice-verification-workflow.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.authentica.sa/llms.txt
> Use this file to discover all available pages before exploring further.

# Voice Verification Workflow

> Implement voice biometric verification

# Voice Verification Workflow

Use the `/verify-by-voice` endpoint to compare two audio samples: a reference audio and a real-time audio recorded by your application.

Authentica analyzes both samples and determines if they match.

## How It Works

1. Provide a `registered_audio` (reference audio)
2. Provide a `query_audio` (real-time audio from your app)
3. Authentica compares them and returns the match result

See the [Verify by Voice API Reference](https://docs.authentica.sa/api-reference/voice-verification/verify-by-voice.md) for detailed parameter documentation.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

---

## Source: https://docs.authentica.sa/api-reference/balance-monitoring/get-current-balance.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.authentica.sa/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Current Balance

> This endpoint retrieves your current account balance.

The balance is displayed in credits, which are used to pay for SMS, WhatsApp, Email, and other verification services.




## OpenAPI

````yaml get /balance
openapi: 3.1.0
info:
  title: Authentica API Documentation
  version: 2.0.0
  description: >
    Authentica provides secure and flexible customer authentication through
    **OTP verification** via **SMS**, **WhatsApp**, and **Email**.

    It also supports **Face** and **Voice** verification for enhanced identity
    assurance.


    You can easily integrate with our system using RESTful APIs and manage your
    authentication process through multiple secure and customizable channels.


    Our system provides many templates to send OTP messages via SMS channel
    using Authentica default sender name.


    Our APIs are designed for easy integration, offering clear endpoints to help
    you implement robust authentication solutions in your applications.


    ## Getting Started


    1. Sign up for an Authentica account at
    [https://portal.authentica.sa](https://portal.authentica.sa)

    2. [Get Your API Key](https://portal.authentica.sa/applications/)

    3. Use your API key in the `X-Authorization` header for all requests


    ## Workflows


    ### OTP Verification Workflow


    1. **Send OTP** - Use the `/send-otp` endpoint to send an OTP via SMS,
    WhatsApp, or Email

    2. **Verify OTP** - Use the `/verify-otp` endpoint to validate the OTP
    entered by your customer


    ### Face Verification Workflow


    Use the `/verify-by-face` endpoint to compare two images: a reference image
    and a real-time image captured by your application.


    ### Voice Verification Workflow


    Use the `/verify-by-voice` endpoint to compare two audio samples: a
    reference audio and a real-time audio recorded by your application.
  contact:
    name: Authentica Support
    url: https://wa.me/966536553944
servers:
  - url: https://api.authentica.sa/api/v2
    description: Production server
security:
  - ApiKeyAuth: []
tags:
  - name: Balance Monitoring
    description: Monitor your account balance and credits
  - name: OTP Verification
    description: Send and verify one-time passwords via SMS, WhatsApp, or Email
  - name: Face Verification
    description: Verify users through facial recognition
  - name: Voice Verification
    description: Verify users through voice biometrics
paths:
  /balance:
    get:
      tags:
        - Balance Monitoring
      summary: Get Current Balance
      description: >
        This endpoint retrieves your current account balance.


        The balance is displayed in credits, which are used to pay for SMS,
        WhatsApp, Email, and other verification services.
      operationId: getBalance
      responses:
        '200':
          description: Balance retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      balance:
                        type: number
                        example: 21934
                        description: Current account balance in credits
                  message:
                    type: string
                    example: Balance retrieved successfully
              examples:
                success:
                  summary: Successful balance retrieval
                  value:
                    success: true
                    data:
                      balance: 21934
                    message: Balance retrieved successfully
        '401':
          description: Unauthorized - Invalid or missing API key
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                unauthorized:
                  summary: Unauthorized error
                  value:
                    errors:
                      - message: Unauthorized
components:
  schemas:
    Error:
      type: object
      properties:
        errors:
          type: array
          items:
            type: object
            properties:
              message:
                type: string
                example: Unauthorized
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Authorization
      description: >
        API key for authentication. [Get Your API
        Key](https://portal.authentica.sa/applications/)

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

---

## Source: https://docs.authentica.sa/api-reference/otp-verification/send-otp.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.authentica.sa/llms.txt
> Use this file to discover all available pages before exploring further.

# Send OTP

> Send an OTP (One-Time Password) to a user's mobile number or email address.

**Features:**
- SMS delivery via your own sender name or Authentica's default sender
- Email delivery via your own email or Authentica's default email
- Multiple templates available

**Note:** Check Application settings on Authentica dashboard to set default values for OTP options.




## OpenAPI

````yaml post /send-otp
openapi: 3.1.0
info:
  title: Authentica API Documentation
  version: 2.0.0
  description: >
    Authentica provides secure and flexible customer authentication through
    **OTP verification** via **SMS**, **WhatsApp**, and **Email**.

    It also supports **Face** and **Voice** verification for enhanced identity
    assurance.


    You can easily integrate with our system using RESTful APIs and manage your
    authentication process through multiple secure and customizable channels.


    Our system provides many templates to send OTP messages via SMS channel
    using Authentica default sender name.


    Our APIs are designed for easy integration, offering clear endpoints to help
    you implement robust authentication solutions in your applications.


    ## Getting Started


    1. Sign up for an Authentica account at
    [https://portal.authentica.sa](https://portal.authentica.sa)

    2. [Get Your API Key](https://portal.authentica.sa/applications/)

    3. Use your API key in the `X-Authorization` header for all requests


    ## Workflows


    ### OTP Verification Workflow


    1. **Send OTP** - Use the `/send-otp` endpoint to send an OTP via SMS,
    WhatsApp, or Email

    2. **Verify OTP** - Use the `/verify-otp` endpoint to validate the OTP
    entered by your customer


    ### Face Verification Workflow


    Use the `/verify-by-face` endpoint to compare two images: a reference image
    and a real-time image captured by your application.


    ### Voice Verification Workflow


    Use the `/verify-by-voice` endpoint to compare two audio samples: a
    reference audio and a real-time audio recorded by your application.
  contact:
    name: Authentica Support
    url: https://wa.me/966536553944
servers:
  - url: https://api.authentica.sa/api/v2
    description: Production server
security:
  - ApiKeyAuth: []
tags:
  - name: Balance Monitoring
    description: Monitor your account balance and credits
  - name: OTP Verification
    description: Send and verify one-time passwords via SMS, WhatsApp, or Email
  - name: Face Verification
    description: Verify users through facial recognition
  - name: Voice Verification
    description: Verify users through voice biometrics
paths:
  /send-otp:
    post:
      tags:
        - OTP Verification
      summary: Send OTP
      description: >
        Send an OTP (One-Time Password) to a user's mobile number or email
        address.


        **Features:**

        - SMS delivery via your own sender name or Authentica's default sender

        - Email delivery via your own email or Authentica's default email

        - Multiple templates available


        **Note:** Check Application settings on Authentica dashboard to set
        default values for OTP options.
      operationId: sendOtp
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                method:
                  type: string
                  enum:
                    - sms
                    - whatsapp
                    - email
                  description: >-
                    Delivery method for the OTP. Required if no default channel
                    is configured.
                  example: sms
                phone:
                  type: string
                  description: >-
                    Valid international phone number. Required if method is sms
                    or whatsapp.
                  example: '+966551234567'
                  pattern: ^\+[1-9]\d{1,14}$
                email:
                  type: string
                  format: email
                  description: Valid email address. Required if method is email.
                  example: user@example.com
                template_id:
                  type: integer
                  description: Template ID for the OTP message. Default is 1.
                  example: 31
                  default: 1
            examples:
              sms:
                summary: Send OTP via SMS
                value:
                  method: sms
                  phone: '+966551234567'
                  template_id: 31
              whatsapp:
                summary: Send OTP via WhatsApp
                value:
                  method: whatsapp
                  phone: '+966551234567'
                  template_id: 1
              email:
                summary: Send OTP via Email
                value:
                  method: email
                  email: user@example.com
                  template_id: 1
      responses:
        '200':
          description: OTP sent successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    nullable: true
                  message:
                    type: string
                    example: OTP send successfully
              examples:
                success:
                  summary: OTP sent successfully
                  value:
                    success: true
                    data: null
                    message: OTP send successfully
        '401':
          description: Unauthorized - Invalid or missing API key
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    Error:
      type: object
      properties:
        errors:
          type: array
          items:
            type: object
            properties:
              message:
                type: string
                example: Unauthorized
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Authorization
      description: >
        API key for authentication. [Get Your API
        Key](https://portal.authentica.sa/applications/)

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

---

## Source: https://docs.authentica.sa/api-reference/otp-verification/verify-otp.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.authentica.sa/llms.txt
> Use this file to discover all available pages before exploring further.

# Verify OTP

> Verify the OTP entered by your customer for authentication.

This endpoint validates the OTP against the one sent via `/send-otp` endpoint.




## OpenAPI

````yaml post /verify-otp
openapi: 3.1.0
info:
  title: Authentica API Documentation
  version: 2.0.0
  description: >
    Authentica provides secure and flexible customer authentication through
    **OTP verification** via **SMS**, **WhatsApp**, and **Email**.

    It also supports **Face** and **Voice** verification for enhanced identity
    assurance.


    You can easily integrate with our system using RESTful APIs and manage your
    authentication process through multiple secure and customizable channels.


    Our system provides many templates to send OTP messages via SMS channel
    using Authentica default sender name.


    Our APIs are designed for easy integration, offering clear endpoints to help
    you implement robust authentication solutions in your applications.


    ## Getting Started


    1. Sign up for an Authentica account at
    [https://portal.authentica.sa](https://portal.authentica.sa)

    2. [Get Your API Key](https://portal.authentica.sa/applications/)

    3. Use your API key in the `X-Authorization` header for all requests


    ## Workflows


    ### OTP Verification Workflow


    1. **Send OTP** - Use the `/send-otp` endpoint to send an OTP via SMS,
    WhatsApp, or Email

    2. **Verify OTP** - Use the `/verify-otp` endpoint to validate the OTP
    entered by your customer


    ### Face Verification Workflow


    Use the `/verify-by-face` endpoint to compare two images: a reference image
    and a real-time image captured by your application.


    ### Voice Verification Workflow


    Use the `/verify-by-voice` endpoint to compare two audio samples: a
    reference audio and a real-time audio recorded by your application.
  contact:
    name: Authentica Support
    url: https://wa.me/966536553944
servers:
  - url: https://api.authentica.sa/api/v2
    description: Production server
security:
  - ApiKeyAuth: []
tags:
  - name: Balance Monitoring
    description: Monitor your account balance and credits
  - name: OTP Verification
    description: Send and verify one-time passwords via SMS, WhatsApp, or Email
  - name: Face Verification
    description: Verify users through facial recognition
  - name: Voice Verification
    description: Verify users through voice biometrics
paths:
  /verify-otp:
    post:
      tags:
        - OTP Verification
      summary: Verify OTP
      description: >
        Verify the OTP entered by your customer for authentication.


        This endpoint validates the OTP against the one sent via `/send-otp`
        endpoint.
      operationId: verifyOtp
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - otp
              properties:
                phone:
                  type: string
                  description: >-
                    Phone number used to send the OTP. Required if sms or
                    whatsapp was used.
                  example: '+966551234567'
                email:
                  type: string
                  format: email
                  description: Email used to send the OTP. Required if email was used.
                  example: user@example.com
                otp:
                  type: string
                  description: The OTP entered by the customer
                  example: '123456'
            examples:
              phone:
                summary: Verify OTP with phone number
                value:
                  phone: '+966551234567'
                  otp: '123456'
              email:
                summary: Verify OTP with email
                value:
                  email: user@example.com
                  otp: '123456'
      responses:
        '200':
          description: OTP verified successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: OTP verified successfully
              examples:
                success:
                  summary: OTP verified successfully
                  value:
                    status: true
                    message: OTP verified successfully
        '401':
          description: Unauthorized - Invalid or missing API key
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    Error:
      type: object
      properties:
        errors:
          type: array
          items:
            type: object
            properties:
              message:
                type: string
                example: Unauthorized
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Authorization
      description: >
        API key for authentication. [Get Your API
        Key](https://portal.authentica.sa/applications/)

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

---

## Source: https://docs.authentica.sa/api-reference/face-verification/verify-by-face.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.authentica.sa/llms.txt
> Use this file to discover all available pages before exploring further.

# Verify By Face

> Verify whether the reference image and the real-time image match.

This endpoint compares two face images:
- `registered_face_image`: Reference image
- `query_face_image`: Real-time image captured by your application




## OpenAPI

````yaml post /verify-by-face
openapi: 3.1.0
info:
  title: Authentica API Documentation
  version: 2.0.0
  description: >
    Authentica provides secure and flexible customer authentication through
    **OTP verification** via **SMS**, **WhatsApp**, and **Email**.

    It also supports **Face** and **Voice** verification for enhanced identity
    assurance.


    You can easily integrate with our system using RESTful APIs and manage your
    authentication process through multiple secure and customizable channels.


    Our system provides many templates to send OTP messages via SMS channel
    using Authentica default sender name.


    Our APIs are designed for easy integration, offering clear endpoints to help
    you implement robust authentication solutions in your applications.


    ## Getting Started


    1. Sign up for an Authentica account at
    [https://portal.authentica.sa](https://portal.authentica.sa)

    2. [Get Your API Key](https://portal.authentica.sa/applications/)

    3. Use your API key in the `X-Authorization` header for all requests


    ## Workflows


    ### OTP Verification Workflow


    1. **Send OTP** - Use the `/send-otp` endpoint to send an OTP via SMS,
    WhatsApp, or Email

    2. **Verify OTP** - Use the `/verify-otp` endpoint to validate the OTP
    entered by your customer


    ### Face Verification Workflow


    Use the `/verify-by-face` endpoint to compare two images: a reference image
    and a real-time image captured by your application.


    ### Voice Verification Workflow


    Use the `/verify-by-voice` endpoint to compare two audio samples: a
    reference audio and a real-time audio recorded by your application.
  contact:
    name: Authentica Support
    url: https://wa.me/966536553944
servers:
  - url: https://api.authentica.sa/api/v2
    description: Production server
security:
  - ApiKeyAuth: []
tags:
  - name: Balance Monitoring
    description: Monitor your account balance and credits
  - name: OTP Verification
    description: Send and verify one-time passwords via SMS, WhatsApp, or Email
  - name: Face Verification
    description: Verify users through facial recognition
  - name: Voice Verification
    description: Verify users through voice biometrics
paths:
  /verify-by-face:
    post:
      tags:
        - Face Verification
      summary: Verify By Face
      description: |
        Verify whether the reference image and the real-time image match.

        This endpoint compares two face images:
        - `registered_face_image`: Reference image
        - `query_face_image`: Real-time image captured by your application
      operationId: verifyByFace
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - user_id
                - registered_face_image
                - query_face_image
              properties:
                user_id:
                  type: string
                  description: Unique identifier of your user
                  example: user123
                registered_face_image:
                  type: string
                  format: byte
                  description: Base64-encoded reference image
                  example: /9j/4AAQSkZJRgABAQEAYABgAAD...
                query_face_image:
                  type: string
                  format: byte
                  description: Base64-encoded real-time image captured by your application
                  example: /9j/4AAQSkZJRgABAQEAYABgAAD...
            examples:
              verify_face:
                summary: Verify face images
                value:
                  user_id: user123
                  registered_face_image: /9j/4AAQSkZJRgABAQEAYABgAAD...
                  query_face_image: /9j/4AAQSkZJRgABAQEAYABgAAD...
      responses:
        '200':
          description: Face verification completed
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      user_id:
                        type: string
                        example: user123
                      result:
                        type: boolean
                        description: >-
                          Verification result - true if faces match, false
                          otherwise
                        example: true
              examples:
                match:
                  summary: Faces match
                  value:
                    success: true
                    data:
                      user_id: user123
                      result: true
                no_match:
                  summary: Faces don't match
                  value:
                    success: true
                    data:
                      user_id: user123
                      result: false
        '401':
          description: Unauthorized - Invalid or missing API key
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    Error:
      type: object
      properties:
        errors:
          type: array
          items:
            type: object
            properties:
              message:
                type: string
                example: Unauthorized
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Authorization
      description: >
        API key for authentication. [Get Your API
        Key](https://portal.authentica.sa/applications/)

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

---

## Source: https://docs.authentica.sa/api-reference/voice-verification/verify-by-voice.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.authentica.sa/llms.txt
> Use this file to discover all available pages before exploring further.

# Verify By Voice

> Verify whether the reference audio and the real-time audio match.

This endpoint compares two voice samples:
- `registered_audio`: Reference audio
- `query_audio`: Real-time audio recorded by your application




## OpenAPI

````yaml post /verify-by-voice
openapi: 3.1.0
info:
  title: Authentica API Documentation
  version: 2.0.0
  description: >
    Authentica provides secure and flexible customer authentication through
    **OTP verification** via **SMS**, **WhatsApp**, and **Email**.

    It also supports **Face** and **Voice** verification for enhanced identity
    assurance.


    You can easily integrate with our system using RESTful APIs and manage your
    authentication process through multiple secure and customizable channels.


    Our system provides many templates to send OTP messages via SMS channel
    using Authentica default sender name.


    Our APIs are designed for easy integration, offering clear endpoints to help
    you implement robust authentication solutions in your applications.


    ## Getting Started


    1. Sign up for an Authentica account at
    [https://portal.authentica.sa](https://portal.authentica.sa)

    2. [Get Your API Key](https://portal.authentica.sa/applications/)

    3. Use your API key in the `X-Authorization` header for all requests


    ## Workflows


    ### OTP Verification Workflow


    1. **Send OTP** - Use the `/send-otp` endpoint to send an OTP via SMS,
    WhatsApp, or Email

    2. **Verify OTP** - Use the `/verify-otp` endpoint to validate the OTP
    entered by your customer


    ### Face Verification Workflow


    Use the `/verify-by-face` endpoint to compare two images: a reference image
    and a real-time image captured by your application.


    ### Voice Verification Workflow


    Use the `/verify-by-voice` endpoint to compare two audio samples: a
    reference audio and a real-time audio recorded by your application.
  contact:
    name: Authentica Support
    url: https://wa.me/966536553944
servers:
  - url: https://api.authentica.sa/api/v2
    description: Production server
security:
  - ApiKeyAuth: []
tags:
  - name: Balance Monitoring
    description: Monitor your account balance and credits
  - name: OTP Verification
    description: Send and verify one-time passwords via SMS, WhatsApp, or Email
  - name: Face Verification
    description: Verify users through facial recognition
  - name: Voice Verification
    description: Verify users through voice biometrics
paths:
  /verify-by-voice:
    post:
      tags:
        - Voice Verification
      summary: Verify By Voice
      description: |
        Verify whether the reference audio and the real-time audio match.

        This endpoint compares two voice samples:
        - `registered_audio`: Reference audio
        - `query_audio`: Real-time audio recorded by your application
      operationId: verifyByVoice
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - user_id
                - registered_audio
                - query_audio
              properties:
                user_id:
                  type: string
                  description: Unique identifier of your user
                  example: user123
                registered_audio:
                  type: string
                  format: byte
                  description: Base64-encoded reference audio
                  example: SUQzBAAAAAAAIVRYWFgAAAA...
                query_audio:
                  type: string
                  format: byte
                  description: Base64-encoded real-time audio recorded by your application
                  example: SUQzBAAAAAAAIVRYWFgAAAA...
            examples:
              verify_voice:
                summary: Verify voice samples
                value:
                  user_id: user123
                  registered_audio: SUQzBAAAAAAAIVRYWFgAAAA...
                  query_audio: SUQzBAAAAAAAIVRYWFgAAAA...
      responses:
        '200':
          description: Voice verification completed
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      user_id:
                        type: string
                        example: user123
                      result:
                        type: boolean
                        description: >-
                          Verification result - true if voices match, false
                          otherwise
                        example: true
              examples:
                match:
                  summary: Voices match
                  value:
                    success: true
                    data:
                      user_id: user123
                      result: true
                no_match:
                  summary: Voices don't match
                  value:
                    success: true
                    data:
                      user_id: user123
                      result: false
        '401':
          description: Unauthorized - Invalid or missing API key
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    Error:
      type: object
      properties:
        errors:
          type: array
          items:
            type: object
            properties:
              message:
                type: string
                example: Unauthorized
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Authorization
      description: >
        API key for authentication. [Get Your API
        Key](https://portal.authentica.sa/applications/)

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.
