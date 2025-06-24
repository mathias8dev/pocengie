export async function POST(request: Request) {
  try {
    console.log('3D Secure callback received (App Router)');
    
    let PaRes: string | null = null;
    let MD: string | null = null;

    // Helper function to find parameter case-insensitively
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findParam = (obj: any, paramName: string): string | null => {
      if (!obj) return null;
      
      // Direct match first
      if (obj[paramName]) return obj[paramName];
      
      // Case-insensitive search
      const keys = Object.keys(obj);
      const foundKey = keys.find(key => key.toLowerCase() === paramName.toLowerCase());
      return foundKey ? obj[foundKey] : null;
    };

    // Try to parse as JSON first
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const jsonData = await request.json();
        console.log('Parsing as JSON data');
        
        PaRes = findParam(jsonData, 'PaRes') || findParam(jsonData, 'pares');
        MD = findParam(jsonData, 'MD') || findParam(jsonData, 'md');
      } else {
        // Parse as form data
        console.log('Parsing as form data');
        const formData = await request.formData();
        
        // Convert FormData to object for case-insensitive search
        const formObj: Record<string, string> = {};
        for (const [key, value] of formData.entries()) {
          formObj[key] = value.toString();
        }
        
        PaRes = findParam(formObj, 'PaRes') || findParam(formObj, 'pares');
        MD = findParam(formObj, 'MD') || findParam(formObj, 'md');
      }
    } catch (parseError) {
      // If JSON parsing fails, try form data as fallback
      console.log('JSON parsing failed, trying form data fallback');
      try {
        const formData = await request.formData();
        
        // Convert FormData to object for case-insensitive search
        const formObj: Record<string, string> = {};
        for (const [key, value] of formData.entries()) {
          formObj[key] = value.toString();
        }
        
        PaRes = findParam(formObj, 'PaRes') || findParam(formObj, 'pares');
        MD = findParam(formObj, 'MD') || findParam(formObj, 'md');
      } catch (formError) {
        console.error('Both JSON and form data parsing failed:', { parseError, formError });
        return new Response(generateErrorHTML('Format de données non supporté'), {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }

    // Validate required parameters
    if (!PaRes) {
      console.error('Missing PaRes in 3DS callback');
      return new Response(generateErrorHTML('PaRes manquant'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    console.log(`Processing 3DS callback - PaRes length: ${PaRes.length}, MD: ${MD}`);
    return new Response(generateSuccessHTML(PaRes, MD), {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error processing 3D Secure callback:', error);
    return new Response(generateErrorHTML('Erreur interne'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Generate success HTML page
function generateSuccessHTML(
  paRes: string,
  md?: string | null
): string {
  const encodedPaRes = encodeURIComponent(paRes);
  const encodedMd = md ? encodeURIComponent(md) : '';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentification 3D Secure Réussie</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            margin: 0;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
        }
        .success-icon {
            width: 80px;
            height: 80px;
            background: #4CAF50;
            border-radius: 50%;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
        }
        h1 {
            color: #333;
            margin: 0 0 16px;
            font-size: 24px;
            font-weight: 600;
        }
        p {
            color: #666;
            margin: 0 0 32px;
            font-size: 16px;
            line-height: 1.5;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✓</div>
        <h1>Authentification Réussie</h1>
        <p>Votre paiement a été authentifié avec succès. Redirection vers l'application...</p>
     
        
        <div class="spinner"></div>
    </div>

    <script>
        console.log('3D Secure authentication successful');
        
        // Method 1: Try deep link redirect
        setTimeout(() => {
            const deepLinkUrl = \`pocengie://payment/3ds/success?paRes=\${encodeURIComponent('${encodedPaRes}')}&md=\${encodeURIComponent('${encodedMd}')}\`;
            
            console.log('Attempting deep link:', deepLinkUrl);
            window.location.href = deepLinkUrl;
            
        }, 1000);
        
    </script>
</body>
</html>`;
}

// Generate error HTML page
function generateErrorHTML(errorMessage: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erreur Authentification 3D Secure</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            margin: 0;
            padding: 40px 20px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
        }
        .error-icon {
            width: 80px;
            height: 80px;
            background: #f44336;
            border-radius: 50%;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
        }
        h1 {
            color: #333;
            margin: 0 0 16px;
            font-size: 24px;
            font-weight: 600;
        }
        p {
            color: #666;
            margin: 0 0 32px;
            font-size: 16px;
            line-height: 1.5;
        }
        .error-details {
            background: #ffebee;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #c62828;
            border-left: 4px solid #f44336;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover {
            background: #5a6fd8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">✗</div>
        <h1>Erreur d'Authentification</h1>
        <p>Une erreur est survenue lors de l'authentification 3D Secure.</p>
        
        <div class="error-details">
            ${errorMessage}
        </div>
        
        <button onclick="handleError()">Retour à l'application</button>
    </div>

    <script>
        console.error('3D Secure authentication failed:', '${errorMessage}');
        
        function handleError() {
            // Try deep link for error case
            const deepLinkUrl = \`pocengie://payment/3ds/error?message=\${encodeURIComponent('${errorMessage}')}&status=error\`;
            
            console.log('Attempting error deep link:', deepLinkUrl);
            window.location.href = deepLinkUrl;
            
          
        }
        
        // Auto-redirect after 5 seconds
        setTimeout(handleError, 5000);
       
    </script>
</body>
</html>`;
}