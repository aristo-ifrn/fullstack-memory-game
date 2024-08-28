from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt
from .models import Player
import json

def index(request): 
  players = Player.objects.all().order_by("-has_completed", "flips_quantity", "-used_time", "date")
  return render(request, "index.html", {"players": players})

def get(request):
  if request.method == 'GET':
    players = Player.objects.all().order_by("-has_completed", "flips_quantity", "-used_time", "date").values()
    return JsonResponse(list(players), safe=False)
  return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def add(request):
  if request.method == 'POST':
    try:
      data = json.loads(request.body)

      date = parse_datetime(data.get('date'))
      player = Player(
        username=data['username'],
        flips_quantity=data['flips_quantity'],
        used_time=data['used_time'],
        date=date,
        has_completed=data['has_completed']
      )
      player.save()
      return JsonResponse({'status': 'success'}, status=201)
    except Exception as e:
      return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
  return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def delete(request, id):
  player=Player.objects.get(id=id)
  player.delete()
  return redirect("/")