#!/bin/bash
#
# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e
GIT_PRESUBMIT_LINTER='git-presubmit-linter'
RULES="${GIT_PRESUBMIT_LINTER}/rules"

if [ ! -d ${GIT_PRESUBMIT_LINTER} ]; then
    # Clone the git presubmit linter repository
    git clone https://github.com/google/git-presubmit-linter.git
fi
cd ${GIT_PRESUBMIT_LINTER}
git pull origin master
cd ../

# Output changelog from latest tag to HEAD
git fetch
./${GIT_PRESUBMIT_LINTER}/tools/changelog.sh