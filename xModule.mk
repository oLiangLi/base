
LOCAL_PATH := $(my-dir)

$(call clear-local-vars)
LOCAL_MODULE := base
$(call add_general_source_files_under, $(LOCAL_PATH)/src)
$(call add_general_source_files_under, $(LOCAL_PATH)/scanner)
$(call add_general_source_files_under, $(LOCAL_PATH)/Web/Grammar)
$(call build-library)

ifneq ("$(rLANG_CONFIG_MINIMAL_WORLD)","1")

$(call clear-local-vars)
LOCAL_MODULE := __Testings_base__
$(call add_general_source_files_under, $(LOCAL_PATH)/tests)
$(call module_depends, base)
$(call build-executable)

endif ## base/Tests ...
