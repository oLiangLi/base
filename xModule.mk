
LOCAL_PATH := $(my-dir)

$(call clear-local-vars)
LOCAL_MODULE := base
$(call add_general_source_files_under, $(LOCAL_PATH)/src)
$(call add_general_source_files_under, $(LOCAL_PATH)/scanner)
$(call add_general_source_files_under, $(LOCAL_PATH)/Web/Grammar)
$(call build-library)
