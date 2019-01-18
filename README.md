# Contest-judging-tool
A custom tool used to judge official contests on @Khan Academy. :tada:

The tool itself cannot be viewed by the public, but if you have ideas for code improvements, PRs are welcome.

To prepare your own local .env file, here's what each variable means:

- Keys for KA OAuth app*
	- KA_CONSUMER_KEY
	- KA_CONSUMER_SECRET
- Main DB URL*
	- PROD_DB_URL
- Local DB URL that you made
	- DEV_DB_URL
- Secret string used by JWT for web tokens
	- SECRET_KEY
- Port to run on in dev or prod
	- PORT
- Set to 'dev' or 'prod'
	- APP_STATE

\* Ask Jett for these variables.
