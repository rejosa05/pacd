def update_client_details(id, org_name):
    client = ClientDetails.objects.get(id=id)
    client.client_status = "Resolve"
    client.client_org = org_name
    client.save()