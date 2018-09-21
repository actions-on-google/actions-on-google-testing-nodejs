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

TAR=$(yarn pack | grep -Eo "/.*tgz")
# Let's assume there's only one tar in our directory
diff <(tar -tf $TAR | sort) script/expected-files.txt
if [ $? -ne 0 ]; then
    # Packaged files and expected files not the same
    echo "Identified unexpected files in tar"
    exit 1
fi
echo "tar looks good"