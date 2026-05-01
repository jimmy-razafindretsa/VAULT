<?php

namespace App\Actions\Passkeys;

use Spatie\LaravelPasskeys\Actions\ConfigureCeremonyStepManagerFactoryAction as SpatieConfigureCeremonyStepManagerFactoryAction;
use Webauthn\CeremonyStep\CeremonyStepManagerFactory;

class ConfigureCeremonyStepManagerFactoryAction extends SpatieConfigureCeremonyStepManagerFactoryAction
{
    public function execute(): CeremonyStepManagerFactory
    {
        $csmFactory = new CeremonyStepManagerFactory;

        $appUrl = config('app.url');
        $parsedUrl = parse_url($appUrl);
        $host = $parsedUrl['host'] ?? null;

        // We set the allowed origins to include the app URL.
        // This is important for local development where we might use http and non-standard ports.
        $allowedOrigins = [$appUrl];

        // If we are on localhost or 127.0.0.1, we should be more lenient to allow local development
        if ($host === 'localhost' || $host === '127.0.0.1') {
            $csmFactory->setSecuredRelyingPartyId(['localhost', '127.0.0.1']);

            // Common local development URLs
            $localOrigins = [
                'http://localhost:8000',
                'http://127.0.0.1:8000',
                'http://localhost',
                'http://127.0.0.1',
            ];

            foreach ($localOrigins as $origin) {
                if (! in_array($origin, $allowedOrigins)) {
                    $allowedOrigins[] = $origin;
                }
            }
        }

        $csmFactory->setAllowedOrigins($allowedOrigins);

        return $csmFactory;
    }
}
