const HOME = '/home/fas';
const CONFIG_DIR = `${HOME}/dev/fas/platform/dev/config`;
const MONGOD = {
    name: 'mongod',
    cwd: `${HOME}`,
    script: `${HOME}/local/mongo/bin/mongod`,
    args: `--config ${CONFIG_DIR}/mongo/mongod.dev.yml`,
    autorestart: true,
    interpreter: 'bash',
    exec_interpreter: 'none',
    exec_mode: 'fork_mode',
    watch: false
}

const apps = [
    MONGOD,
].filter(a => !a.disabled);

module.exports = {
    apps,
}
