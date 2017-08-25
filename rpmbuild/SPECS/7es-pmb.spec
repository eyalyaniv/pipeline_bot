%global realname pmb

Name:     7es-%{realname}
Version:  %{version}
Release:  1%{?dist}
Summary:  Online Strategy Games Pmb

Group:    Applications
License:  Restricted
Source0:  %{name}-%{version}.zip
Source1:  %{name}.logrotate
Source2:  %{name}.init
Prefix:   opt/7es

BuildRequires:   npm
Requires:        nodejs >= 0.12.0, npm >= 2.10.0, %{name}-config >= %{config}, logrotate >= 3.8.1
Requires(pre):   shadow-utils
%if 0%{?el5}%{?el6}%{?amzn1}
Requires(post):  chkconfig
Requires(preun): chkconfig initscripts
%endif

%description
Online Strategy Games Pmb

%install
export PATH=$PATH:/usr/local/bin
%{__mkdir} -p $RPM_BUILD_ROOT%{_localstatedir}/log/7es "$RPM_BUILD_ROOT/%{prefix}/%{realname}"
%{__unzip} "%{SOURCE0}" -d "$RPM_BUILD_ROOT/%{prefix}/%{realname}"
%{__mkdir} -p $RPM_BUILD_ROOT%{_sysconfdir}/logrotate.d
%{__install} -m 644 -p %{SOURCE1} $RPM_BUILD_ROOT%{_sysconfdir}/logrotate.d/%{name}
cd "$RPM_BUILD_ROOT/%{prefix}/%{realname}/%{version}"
#npm install --production --registry http://npm.osg-worlds.com
%if 0%{?el5}%{?el6}%{?amzn1}
%{__install} -D -m 755 "%{SOURCE2}" "$RPM_BUILD_ROOT%{_initrddir}/%{name}"
%endif

%pre
export PATH=$PATH:/usr/local/bin
npm ls -g pm2 | grep pm2 >/dev/null || npm install -g pm2
getent group osg >/dev/null || groupadd -r osg
getent passwd osg >/dev/null || useradd -r -g osg -s /bin/bash -c "Online Strategy Games" osg

%post
if [ $1 -eq 2 ]; then
    echo "Upgrade process started, deleting old symlinks"
    %{__rm} -rvf /%{prefix}/%{realname}/active
    %{__rm} -rvf /%{prefix}/%{realname}/%{version}/%{name}-index.js
fi
%{__ln_s} /%{prefix}/%{realname}/%{version} /%{prefix}/%{realname}/active
echo "Link created $(ls /%{prefix}/%{realname}/active -l)"
%{__chown} -R osg:osg /%{prefix}/%{realname}/active
%{__ln_s} /%{prefix}/%{realname}/%{version}/index.js /%{prefix}/%{realname}/%{version}/%{name}-index.js
echo "Link created $(ls /%{prefix}/%{realname}/%{version}/%{name}-index.js -l)"
%{__chown} -R osg:osg /%{prefix}/%{realname}/%{version}/%{name}-index.js
if [ -d %{_localstatedir}/log/7es ]; then
    if [ ! -e %{_localstatedir}/log/7es/%{name}.log ]; then
        touch %{_localstatedir}/log/7es/%{name}.log
    fi
    %{__chmod} 644 %{_localstatedir}/log/7es/%{name}.log
    %{__chown} pm2:pm2 %{_localstatedir}/log/7es/%{name}.log
fi
%if 0%{?el5}%{?el6}%{?amzn1}
/sbin/chkconfig --add %{name}
%endif

%preun
%{__rm} -rvf /%{prefix}/%{realname}/%{version}/%{name}-index.js
if [ $1 -eq 0 ] ; then
    echo "Uninstall process started, deleting symlinks"
    %{__rm} -rvf /%{prefix}/%{realname}/active
    %if 0%{?el5}%{?el6}%{?amzn1}
    /sbin/service %{name} stop >/dev/null 2>&1
    /sbin/chkconfig --del %{name}
    %endif
fi

%clean
%{__rm} -rf "$RPM_BUILD_ROOT"

%files
%defattr(644,osg,osg,755)
/%{prefix}/%{realname}/%{version}/
%dir %attr(777,root,osg) %{_localstatedir}/log/7es
%attr(644,root,root) %{_sysconfdir}/logrotate.d/%{name}
%if 0%{?el5}%{?el6}%{?amzn1}
%attr(755,root,root) %{_initrddir}/%{name}
%endif

%changelog
* Tue Feb 5 2014 Matan Eine <matan.eine@gmail.com> 0.8.30rc-1
- Initial RPM release
