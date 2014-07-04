GWC Seeder
----------

Automated, throttled seed requests for GeoWebCache.

## Usage

1. `config/seed-requests.js` should be an array of objects, each with a name
   equal to a layer name that needs to be seeded.
   
2. `config/settings.js` should be configured to point to the right GWC rest endpoint.
   It should also have appropriate settings for operation.

3. Run `npm start` to begin the seeding request process. Let the program run in the background.

4. View `config/status.log` for the status of the tool.
