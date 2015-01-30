GeoWebCache Seeder
------------------

Automated, throttled seed requests for GeoWebCache.

## Usage

`config/default.yml` contains the settings for the seeder. Replace it with your own GWC credentials, and your list of seed requests.

Run `npm start` to begin the seeding request process. Let the program run in the background.

Output is piped to `status.log`, which you can check periodically while the tool runs. Once all seed requests are complete, the tool will exit.
