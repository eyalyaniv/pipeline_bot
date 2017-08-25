module.exports = {
  name       : "7es-pmb",
  script     : "7es-pmb-index.js",
  cwd        : "/opt/7es/pmb/active",
  pid_file   : "/var/run/pm2/7es-pmb.pid",
  out_file   : "/dev/null",
  error_file : "/dev/null",
  exec_mode  : "cluster",
  instances  : 1,
  merge_logs : true,
  autorestart: true,
  watch      : false,
  env: {
    NODE_ENV       : "production",
    OSG_CONFIG_ROOT: "/etc/7es/pmb/dist"
  }
}