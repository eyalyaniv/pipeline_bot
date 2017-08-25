%global realname pmb
%global module config

Name:     7es-%{realname}-%{module}
Version:  %{version}
Release:  1%{?dist}
Summary:  Online Strategy Games Pmb Config
Group:    Applications
License:  Restricted
Source0:  %{name}-%{version}.zip
Prefix:   etc/7es

BuildArch:       noarch
Requires:        nodejs >= 0.12.0, npm >= 2.10.0
Requires(pre):   shadow-utils

%description
Online Strategy Games Pmb Config

%install
%{__mkdir} -p $RPM_BUILD_ROOT/%{prefix}/%{realname}
%{__unzip} %{SOURCE0} -d $RPM_BUILD_ROOT/%{prefix}/%{realname}

%pre
export PATH=$PATH:/usr/local/bin
npm install -g osg-config-mgr --registry http://npm.osg-worlds.com
getent group osg >/dev/null || groupadd -r osg
getent passwd osg >/dev/null || useradd -r -g osg -s /bin/bash -c "Online Strategy Games" osg

%post
export PATH=$PATH:/usr/local/bin
configure -s /%{prefix}/%{realname}/src -t /%{prefix}/%{realname}/dist -l FATAL
%{__chown} -R osg:osg /%{prefix}/%{realname}/dist

%preun
if [ $1 -eq 0 ] ; then
    %{__rm} -rf /%{prefix}/%{realname}/dist
fi

%clean
%{__rm} -rf "$RPM_BUILD_ROOT"

%files
%defattr(644,osg,osg,755)
/%{prefix}/%{realname}/

%changelog
* Thu Mar 13 2014 Matan Eine <matan.eine@gmail.com> 0.1.0rc-1
- Initial RPM release
